import { Linking, Alert } from 'react-native';
import { STRIPE_CONFIG, FIREBASE_FUNCTIONS_URL } from '@config/stripe.config';

class StripeService {
  /**
   * Initiate Stripe Checkout Session
   * Opens Stripe hosted payment page in browser
   */
  async initiateCheckout(userId: string, userEmail: string): Promise<void> {
    try {
      // For now, we'll use a direct Stripe Checkout link
      // In production, this should call your Firebase Function to create a session
      
      // Temporary: Open Stripe test payment page
      // TODO: Replace with actual Firebase Function call after deployment
      const checkoutUrl = await this.createCheckoutSession(userId, userEmail);
      
      // Open the checkout page in browser
      const supported = await Linking.canOpenURL(checkoutUrl);
      if (supported) {
        await Linking.openURL(checkoutUrl);
      } else {
        throw new Error('Cannot open payment link');
      }
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      throw new Error(error.message || 'Failed to initiate checkout');
    }
  }

  /**
   * Create Checkout Session
   * Calls Firebase Function to create a Stripe Checkout session
   */
  private async createCheckoutSession(userId: string, userEmail: string): Promise<string> {
    try {
      // TODO: Uncomment after Firebase Functions are deployed
      /*
      const response = await fetch(FIREBASE_FUNCTIONS_URL.createCheckoutSession, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail,
          priceAmount: STRIPE_CONFIG.subscriptionPrice,
          currency: STRIPE_CONFIG.currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      return data.url;
      */

      // Temporary fallback: Return a placeholder URL
      // This should be replaced with actual Firebase Function URL
      Alert.alert(
        'Setup Required',
        'Firebase Functions need to be deployed first. Please follow the setup instructions in the README.',
      );
      throw new Error('Firebase Functions not yet deployed');
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Verify Premium Status
   * Checks if user has active premium subscription
   */
  async verifyPremiumStatus(userId: string): Promise<boolean> {
    try {
      // TODO: Uncomment after Firebase Functions are deployed
      /*
      const response = await fetch(
        `${FIREBASE_FUNCTIONS_URL.verifyPremiumStatus}?userId=${userId}`,
      );

      if (!response.ok) {
        throw new Error('Failed to verify premium status');
      }

      const data = await response.json();
      return data.isPremium;
      */

      // Temporary: Return false
      return false;
    } catch (error: any) {
      console.error('Verify premium error:', error);
      return false;
    }
  }

  /**
   * Handle deep link callback from Stripe Checkout
   */
  handleCheckoutCallback(url: string): { success: boolean; sessionId?: string } {
    try {
      const urlObj = new URL(url);
      const success = urlObj.searchParams.get('success') === 'true';
      const sessionId = urlObj.searchParams.get('session_id');

      return { success, sessionId: sessionId || undefined };
    } catch (error) {
      return { success: false };
    }
  }
}

export const stripeService = new StripeService();

