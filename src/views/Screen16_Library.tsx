import React from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigation } from '../context/NavigationContext';
import { PurchaseCard } from '../components/cards/PurchaseCard';
import { EmptyState } from '../components/common/EmptyState';
import { LibraryIcon } from '../assets/icons/Icons';

export const Screen16_Library: React.FC = () => {
  const { purchases, products } = useProducts();
  const { openUnlockedViewer, navigateTo } = useNavigation();

  // Purchases for this user or all authorized if demo buyer
  const userPurchases = purchases.filter((p) => p.status === 'successful');

  return (
    <div className="app-content p-page">
      <div style={{ marginBottom: 20 }}>
        <span className="text-label">YOUR COLLECTION</span>
        <h1 className="text-headline" style={{ marginTop: 2 }}>
          YOUR LIBRARY
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
          All exclusive drops and digital unlocks authorized for your account.
        </p>
      </div>

      {userPurchases.length === 0 ? (
        <EmptyState
          title="NO UNLOCKED CONTENT"
          description="Content unlocked through shared creator links will appear here permanently."
          actionText="EXPLORE DROPS"
          onAction={() => navigateTo('home')}
          icon={<LibraryIcon size={28} />}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {userPurchases.map((purchase) => {
            const product = products.find((p) => p.id === purchase.productId);
            return (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                product={product}
                onClick={() => openUnlockedViewer(purchase.productId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
