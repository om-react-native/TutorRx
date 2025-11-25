import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
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
        success_url: `tutorrx://payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `tutorrx://payment-cancel`,
        metadata: {
          userId: userId,
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Handle Stripe Webhook Events
 * Processes Stripe webhook events (payment success, subscription updates, etc.)
 */
export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId) {
          // Update user subscription status in Firestore
          await admin.firestore().collection('users').doc(userId).update({
            subscriptionStatus: 'premium',
            subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
          });

          console.log(`User ${userId} upgraded to premium`);
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
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: error.message });
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

      const userDoc = await admin.firestore().collection('users').doc(userId).get();

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
    } catch (error: any) {
      console.error('Error verifying premium status:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

