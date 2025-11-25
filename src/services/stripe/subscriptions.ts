import { initStripe } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@constants/stripe';

// Initialize Stripe (call this in App.tsx)
export const initializeStripe = () => {
  try {
    if (STRIPE_PUBLISHABLE_KEY) {
      initStripe({
        publishableKey: STRIPE_PUBLISHABLE_KEY,
      });
    }
  } catch (error) {
    // Stripe initialization failed - app can still run without it
    console.warn('Stripe initialization failed:', error);
  }
};

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited AI chat',
      'Unlimited scenarios',
      'Unlimited study plans',
      'Advanced rationales',
      'Flashcard mastery reports',
    ],
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 99.99,
    interval: 'year',
    features: [
      'Unlimited AI chat',
      'Unlimited scenarios',
      'Unlimited study plans',
      'Advanced rationales',
      'Flashcard mastery reports',
      'Save 17% vs monthly',
    ],
  },
];

class SubscriptionService {
  async purchaseSubscription(tierId: string): Promise<void> {
    try {
      // This would typically call your backend to create a payment intent
      // For now, this is a placeholder
      throw new Error('Subscription purchase not implemented');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to purchase subscription');
    }
  }

  async restorePurchases(): Promise<void> {
    try {
      // Implement restore purchases logic
      throw new Error('Restore purchases not implemented');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to restore purchases');
    }
  }
}

export const subscriptionService = new SubscriptionService();

