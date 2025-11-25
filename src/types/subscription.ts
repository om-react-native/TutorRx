export type SubscriptionStatus = 'free' | 'premium';

export interface Subscription {
  status: SubscriptionStatus;
  tier?: 'monthly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

