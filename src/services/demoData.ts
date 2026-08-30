import { Product, User, ActivityItem, Purchase, AccessPermission } from '../types';

export const INITIAL_USER: User = {
  id: 'usr_' + Math.random().toString(36).substring(2, 9),
  name: 'Creator',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  handle: 'creator',
  role: 'creator',
  balance: 0.00,
  totalEarnings: 0.00,
  currency: 'AED',
  createdAt: new Date().toISOString()
};

export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_ACTIVITIES: ActivityItem[] = [];
export const INITIAL_PURCHASES: Purchase[] = [];
export const INITIAL_PERMISSIONS: AccessPermission[] = [];
