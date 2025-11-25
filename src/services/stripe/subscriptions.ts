import { initStripe, initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@constants/stripe';
import { FIREBASE_FUNCTIONS_URL } from '@config/stripe.config';

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
  /**
   * Purchase premium access using Stripe PaymentSheet
   * This creates a PaymentIntent via Firebase Functions and presents
   * Stripe's in-app UI for card entry.
   */
  async purchaseSubscription(userId: string): Promise<void> {
    try {
      if (
        !FIREBASE_FUNCTIONS_URL.createPremiumPaymentIntent ||
        FIREBASE_FUNCTIONS_URL.createPremiumPaymentIntent.includes('your-project')
      ) {
        throw new Error(
          'Payment service is not configured. Please update FIREBASE_FUNCTIONS_URL in stripe.config.ts.',
        );
      }

      // 1. Ask backend to create a PaymentIntent for premium purchase
      const response = await fetch(
        FIREBASE_FUNCTIONS_URL.createPremiumPaymentIntent,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
          }),
        },
      );

      if (!response.ok) {
        let errorText: string | undefined;
        try {
          errorText = await response.text();
        } catch {
          // ignore
        }
        console.warn(
          'createPremiumPaymentIntent error:',
          response.status,
          errorText,
        );
        throw new Error('Failed to start payment');
      }

      const data = await response.json();
      const clientSecret = data?.clientSecret;

      if (!clientSecret) {
        throw new Error('Invalid payment configuration from server');
      }

      // 2. Initialize PaymentSheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'TutorRx',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // 3. Present PaymentSheet for in-app card entry
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          throw new Error('Payment was canceled');
        }
        throw new Error(presentError.message);
      }

      // If we reach here, payment succeeded. Updating the user's
      // subscription status in Firestore is handled in the app layer.
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

