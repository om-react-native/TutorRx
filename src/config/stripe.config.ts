// Stripe Configuration
// WARNING: In production, use environment variables or secure storage
// Never commit secret keys to version control

export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_51SXJCLRhnmCjoZSR3ok7dkwImQZ5YkMLIP2MMYZMsXeHrxjRLsHT4nUNklHf7CsATvehC1RG4Sn1GSq1PvJv3U7O00qKdSnhYc',
  // Secret key should ONLY be used in Firebase Functions, never in the app
  merchantName: 'TutorRx',
  subscriptionPrice: 19.99,
  currency: 'usd',
};

// Firebase Functions URL (update after deployment)
export const FIREBASE_FUNCTIONS_URL = {
  createCheckoutSession: 'https://us-central1-tutorrx-36144.cloudfunctions.net/createCheckoutSession',
  verifyPremiumStatus: 'https://us-central1-tutorrx-36144.cloudfunctions.net/verifyPremiumStatus',
  createPremiumPaymentIntent: 'https://us-central1-tutorrx-36144.cloudfunctions.net/createPremiumPaymentIntent',
};

