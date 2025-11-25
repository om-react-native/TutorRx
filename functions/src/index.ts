import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Resolve Stripe secret key from env or Firebase Functions config
const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || functions.config().stripe?.secret_key || '';

if (!stripeSecretKey) {
  // Fail fast so misconfiguration is obvious in Functions logs
  throw new Error(
    'Stripe secret key is not configured. Set STRIPE_SECRET_KEY env var or ' +
      'functions.config().stripe.secret_key',
  );
}

// Initialize Stripe with your secret key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// CORS configuration
const corsHandler = cors({ origin: true });

/**
 * Create Stripe Checkout Session
 * Creates a Stripe Checkout session for subscription payment
 */
export const createCheckoutSession = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { userId, userEmail, priceAmount, currency } = req.body;

      if (!userId || !userEmail) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: currency || 'usd',
              product_data: {
                name: 'TutorRx Premium',
                description: 'Monthly subscription to TutorRx Premium features',
              },
              unit_amount: Math.round((priceAmount || 19.99) * 100), // Convert to cents
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        success_url: 'tutorrx://payment-success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'tutorrx://payment-cancel',
        metadata: {
          userId: userId,
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: message });
    }
  });
});

/**
 * Create PaymentIntent for in-app premium purchase (PaymentSheet)
 */
export const createPremiumPaymentIntent = functions.https.onRequest(
  (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      try {
        const { userId, amount, currency } = req.body;

        if (!userId) {
          res.status(400).json({ error: 'Missing userId parameter' });
          return;
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round((amount || 19.99) * 100),
          currency: currency || 'usd',
          metadata: {
            userId,
          },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        console.error('Error creating premium payment intent:', error);
        const message =
          error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({ error: message });
      }
    });
  },
);

/**
 * Handle Stripe Webhook Events
 * Processes Stripe webhook events (payment success, subscription updates, etc.)
 */
export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET ||
    functions.config().stripe?.webhook_secret ||
    '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown webhook error';
    console.error('Webhook signature verification failed:', message);
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }

  // Handle the event
  try {
    switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        // Compute a simple one-month expiry window from now
        const expiresAtDate = new Date();
        expiresAtDate.setMonth(expiresAtDate.getMonth() + 1);

        // Update user subscription status in Firestore
        await admin
          .firestore()
          .collection('users')
          .doc(userId)
          .set(
            {
              subscriptionStatus: 'premium',
              subscriptionUpdatedAt:
                admin.firestore.FieldValue.serverTimestamp(),
              subscriptionExpiresAt:
                admin.firestore.Timestamp.fromDate(expiresAtDate),
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
            },
            { merge: true },
          );

        console.log(`User ${userId} upgraded to premium`);
      }
      break;
    }

    case 'payment_intent.succeeded': {
      // Handle in-app PaymentSheet purchases that use PaymentIntents
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const userId = (paymentIntent.metadata?.userId as string) || undefined;

      if (userId) {
        const expiresAtDate = new Date();
        expiresAtDate.setMonth(expiresAtDate.getMonth() + 1);

        await admin
          .firestore()
          .collection('users')
          .doc(userId)
          .set(
            {
              subscriptionStatus: 'premium',
              subscriptionUpdatedAt:
                admin.firestore.FieldValue.serverTimestamp(),
              subscriptionExpiresAt:
                admin.firestore.Timestamp.fromDate(expiresAtDate),
            },
            { merge: true },
          );

        console.log(
          `User ${userId} upgraded to premium from PaymentIntent ${paymentIntent.id}`,
        );
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Find user by Stripe customer ID
      const usersSnapshot = await admin
        .firestore()
        .collection('users')
        .where('stripeCustomerId', '==', customerId)
        .get();

      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        await userDoc.ref.update({
          subscriptionStatus: 'free',
          subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`User ${userDoc.id} downgraded to free`);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status;

      // Find user by Stripe customer ID
      const usersSnapshot = await admin
        .firestore()
        .collection('users')
        .where('stripeCustomerId', '==', customerId)
        .get();

      if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        const subscriptionStatus =
            status === 'active' || status === 'trialing' ? 'premium' : 'free';

        await userDoc.ref.update({
          subscriptionStatus,
          subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`User ${userDoc.id} subscription updated: ${subscriptionStatus}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: message });
  }
});

/**
 * Verify Premium Status
 * Checks if a user has an active premium subscription
 */
export const verifyPremiumStatus = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        res.status(400).json({ error: 'Missing userId parameter' });
        return;
      }

      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const userData = userDoc.data();
      const isPremium = userData?.subscriptionStatus === 'premium';

      res.json({
        isPremium,
        subscriptionStatus: userData?.subscriptionStatus || 'free',
      });
    } catch (error) {
      console.error('Error verifying premium status:', error);
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: message });
    }
  });
});

