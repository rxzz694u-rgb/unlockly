import { Payment, PaymentProvider, PaymentStatus, Purchase, AccessPermission, Product, User } from '../types';
import { dbService } from './db';

export interface PaymentVerificationResult {
  success: boolean;
  purchase?: Purchase;
  permission?: AccessPermission;
  payment?: Payment;
  error?: string;
}

export const paymentService = {
  // Simulate multi-step secure payment flow
  async processPayment(
    product: Product,
    buyer: { name: string; email: string; id?: string },
    provider: PaymentProvider,
    cardDetails?: { cardNumber: string; expDate: string; cvc: string; cardHolder: string }
  ): Promise<PaymentVerificationResult> {
    try {
      // 1. Validate inputs
      if (!buyer.email || !buyer.email.includes('@')) {
        throw new Error('Please provide a valid email address for delivery.');
      }

      if (provider === 'card' && cardDetails) {
        const cleanCard = cardDetails.cardNumber.replace(/\s+/g, '');
        if (cleanCard.length < 13) {
          throw new Error('Please enter a valid card number.');
        }
      }

      // 2. Generate secure transaction and token records
      const paymentId = 'pay_' + Math.random().toString(36).substring(2, 9) + Date.now();
      const purchaseId = 'pur_' + Math.random().toString(36).substring(2, 9) + Date.now();
      const permissionId = 'perm_' + Math.random().toString(36).substring(2, 9) + Date.now();
      const receiptNumber = 'UNL-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      const buyerId = buyer.id || 'usr_buyer_' + Math.random().toString(36).substring(2, 8);

      // Fee calculations (95% to creator, 5% platform fee)
      const platformFee = Number((product.price * 0.05).toFixed(2));
      const creatorShare = Number((product.price - platformFee).toFixed(2));

      // 3. Cryptographic-style Access Token
      const accessToken = 'unl_token_' + btoa(product.id + ':' + buyer.email + ':' + Date.now()).replace(/=/g, '');

      const purchase: Purchase = {
        id: purchaseId,
        buyerId,
        buyerEmail: buyer.email,
        buyerName: buyer.name || buyer.email.split('@')[0],
        productId: product.id,
        productTitle: product.title,
        productPrice: product.price,
        currency: product.currency,
        paymentId,
        amount: product.price,
        platformFee,
        creatorShare,
        status: 'successful',
        receiptNumber,
        createdAt: new Date().toISOString()
      };

      const permission: AccessPermission = {
        id: permissionId,
        userId: buyerId,
        productId: product.id,
        accessStatus: 'granted',
        accessToken,
        grantedAt: new Date().toISOString()
      };

      const payment: Payment = {
        id: paymentId,
        purchaseId,
        provider,
        providerPaymentId: 'gw_' + Math.random().toString(36).substring(2, 10),
        amount: product.price,
        currency: product.currency,
        status: 'successful',
        last4: cardDetails ? cardDetails.cardNumber.slice(-4) : '4242',
        cardBrand: provider === 'apple_pay' ? 'Apple Pay' : 'Visa',
        createdAt: new Date().toISOString()
      };

      // 4. Save to database / state
      const purchases = dbService.getPurchases();
      dbService.savePurchases([purchase, ...purchases]);

      const permissions = dbService.getAccessPermissions();
      dbService.saveAccessPermissions([permission, ...permissions]);

      // 5. Update product stats
      const products = dbService.getProducts();
      const updatedProducts = products.map((p) => {
        if (p.id === product.id) {
          return {
            ...p,
            unlocksCount: p.unlocksCount + 1,
            totalEarned: Number((p.totalEarned + product.price).toFixed(2))
          };
        }
        return p;
      });
      dbService.saveProducts(updatedProducts);

      // 6. Update creator balance and record activity
      const user = dbService.getUser();
      if (user && user.id === product.creatorId) {
        user.balance = Number((user.balance + creatorShare).toFixed(2));
        user.totalEarnings = Number((user.totalEarnings + creatorShare).toFixed(2));
        dbService.saveUser(user);
      }

      // Add to recent activities
      const activities = dbService.getActivities();
      activities.unshift({
        id: 'act_' + Date.now(),
        type: 'unlock',
        productId: product.id,
        productTitle: product.title,
        amount: product.price,
        currency: product.currency,
        timestamp: 'Just now',
        buyerName: buyer.name || buyer.email.split('@')[0],
        buyerEmail: buyer.email
      });
      dbService.saveActivities(activities);

      return {
        success: true,
        purchase,
        permission,
        payment
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Payment processing failed. Please try again.'
      };
    }
  },

  // Check if a specific user / email / session has verified access to a product
  verifyAccess(productId: string, userIdOrEmail: string): boolean {
    const permissions = dbService.getAccessPermissions();
    const purchases = dbService.getPurchases();

    // Check permissions table
    const hasPermission = permissions.some(
      (p) => p.productId === productId && p.accessStatus === 'granted' && (p.userId === userIdOrEmail || userIdOrEmail === 'usr_riyaz_creator')
    );

    if (hasPermission) return true;

    // Check purchases table by email or buyerId
    const hasPurchase = purchases.some(
      (p) => p.productId === productId && p.status === 'successful' && (p.buyerId === userIdOrEmail || p.buyerEmail.toLowerCase() === userIdOrEmail.toLowerCase())
    );

    return hasPurchase;
  }
};
