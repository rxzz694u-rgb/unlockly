import { Product, User, ActivityItem, Purchase, AccessPermission } from '../types';

export const INITIAL_CREATOR: User = {
  id: 'usr_riyaz_creator',
  name: 'Riyaz Ahmed',
  email: 'riyaz@unlockly.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  handle: 'riyaz_creates',
  role: 'creator',
  balance: 0.00,
  totalEarnings: 0.00,
  currency: 'AED',
  payoutIban: 'AE07 0331 2345 6789 0123 456',
  payoutMethod: 'Emirates NBD Direct Transfer',
  createdAt: new Date().toISOString()
};

export const DEMO_BUYER: User = {
  id: 'usr_buyer_demo',
  name: 'Sarah Connor',
  email: 'sarah.c@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  handle: 'sarah_collector',
  role: 'buyer',
  balance: 0,
  totalEarnings: 0,
  currency: 'AED',
  createdAt: new Date().toISOString()
};

export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_ACTIVITIES: ActivityItem[] = [];
export const INITIAL_PURCHASES: Purchase[] = [];
export const INITIAL_PERMISSIONS: AccessPermission[] = [];
