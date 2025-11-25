# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment integration with Firebase Cloud Functions for TutorRx premium subscriptions.

## Prerequisites

- Firebase Project with Blaze (Pay as you go) plan enabled
- Stripe Account (Test mode for development)
- Node.js 18 or higher
- Firebase CLI installed globally (`npm install -g firebase-tools`)

## Step 1: Firebase Project Setup

### Enable Cloud Functions

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Build** → **Functions**
4. Click **Upgrade project** if you haven't already (Blaze plan required)
5. Follow the prompts to enable billing

### Enable Firestore (if not already enabled)

1. Navigate to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Production mode**
4. Select your preferred location

## Step 2: Install Firebase Functions Dependencies

```bash
cd functions
npm install
```

This will install:
- `firebase-admin` - Firebase Admin SDK
- `firebase-functions` - Cloud Functions SDK
- `stripe` - Stripe Node.js SDK
- `cors` - CORS middleware

## Step 3: Configure Firebase Functions Environment

Set the Stripe secret key in Firebase Functions config:

```bash
firebase functions:config:set stripe.secret_key="YOUR_STRIPE_SECRET_KEY"
```

**Important:** 
- Get your secret key from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- Use test key (`sk_test_...`) for development
- Use live key (`sk_live_...`) for production

## Step 4: Deploy Firebase Functions

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase Project (if not already done)

```bash
firebase init functions
```

Select:
- Use an existing project (select your TutorRx project)
- TypeScript
- ESLint (optional)
- Install dependencies

### Build and Deploy

```bash
cd functions
npm run build
firebase deploy --only functions
```

After deployment, you'll see URLs like:
```
✔ functions[createCheckoutSession(us-central1)]: https://us-central1-your-project.cloudfunctions.net/createCheckoutSession
✔ functions[handleStripeWebhook(us-central1)]: https://us-central1-your-project.cloudfunctions.net/handleStripeWebhook
✔ functions[verifyPremiumStatus(us-central1)]: https://us-central1-your-project.cloudfunctions.net/verifyPremiumStatus
```

**Save these URLs!** You'll need them in the next steps.

## Step 5: Update App Configuration

Update the Firebase Functions URLs in `src/config/stripe.config.ts`:

```typescript
export const FIREBASE_FUNCTIONS_URL = {
  createCheckoutSession: 'https://us-central1-your-project.cloudfunctions.net/createCheckoutSession',
  verifyPremiumStatus: 'https://us-central1-your-project.cloudfunctions.net/verifyPremiumStatus',
};
```

Replace `your-project` with your actual Firebase project ID.

## Step 6: Configure Stripe Webhook

### Create Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Enter the webhook URL (from Step 4):
   ```
   https://us-central1-your-project.cloudfunctions.net/handleStripeWebhook
   ```
5. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
6. Click **Add endpoint**

### Add Webhook Secret to Firebase Config

After creating the webhook, copy the **Signing secret** (starts with `whsec_`) and run:

```bash
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret_here"
```

Then redeploy:

```bash
cd functions
firebase deploy --only functions
```

## Step 7: Create Stripe Product and Price

### Option A: Using Stripe Dashboard

1. Go to **Products** in Stripe Dashboard
2. Click **Add product**
3. Enter product details:
   - Name: `TutorRx Premium`
   - Description: `Monthly subscription to TutorRx Premium features`
4. Add a price:
   - Pricing model: `Standard pricing`
   - Price: `$19.99`
   - Billing period: `Monthly`
   - Currency: `USD`
5. Click **Save product**

### Option B: Let the Function Create It Dynamically

The `createCheckoutSession` function already creates prices dynamically. No additional setup needed.

## Step 8: Test the Integration

### Test Mode

1. Launch the app
2. Navigate to **Profile** → **Premium**
3. Click **Subscribe**
4. You'll see a message about setup requirements (until you update the config)
5. After updating URLs in Step 5, the Stripe Checkout page should open
6. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Use any future expiry date and any 3-digit CVC

### Verify Premium Status

After successful payment:
1. Check Firestore Console → `users` collection
2. Find your user document
3. Verify `subscriptionStatus: "premium"` field is set

### Test Webhook

1. In Stripe Dashboard, go to **Webhooks**
2. Click on your webhook endpoint
3. Check the **Events** tab to see received events
4. Verify events are being processed (status 200)

## Step 9: Update Firestore Security Rules

Add rules to protect subscription status:

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId
                    && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['subscriptionStatus', 'stripeCustomerId', 'stripeSubscriptionId']);
    }
  }
}
```

This prevents users from manually updating their subscription status.

## Step 10: Production Setup

### Switch to Live Mode

1. Get your live Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Update Firebase Functions config:
   ```bash
   firebase functions:config:set stripe.secret_key="sk_live_your_live_key"
   ```
3. Update app config with live publishable key in `src/config/stripe.config.ts`
4. Create new webhook for production URL
5. Update webhook secret in Firebase config
6. Redeploy functions

### Important Production Considerations

- **Never commit API keys** to version control
- Use environment variables or secure config management
- Enable Stripe production webhook
- Test thoroughly before going live
- Set up proper error monitoring (Firebase Crashlytics, Sentry)
- Implement proper refund handling
- Add subscription management UI (cancel, update payment method)

## Troubleshooting

### Function not deploying

- Ensure Firebase project is on Blaze plan
- Check Node.js version (must be 18 or higher)
- Run `npm run build` in functions directory to check for TypeScript errors

### Webhook not receiving events

- Verify webhook URL is correct
- Check webhook secret is set correctly
- Look at Firebase Functions logs: `firebase functions:log`
- Check Stripe webhook logs in dashboard

### Subscription status not updating

- Check Firestore security rules allow updates
- Verify webhook is processing events (check logs)
- Ensure user document has correct structure

### CORS errors

- Functions use `cors({ origin: true })` to allow all origins
- For production, restrict origins to your app domains

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Stripe React Native Guide](https://stripe.com/docs/mobile/react-native)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## Support

For issues with:
- Stripe integration: [Stripe Support](https://support.stripe.com/)
- Firebase Functions: [Firebase Support](https://firebase.google.com/support)
- App-specific issues: Check the main README.md

---

**Note:** This setup uses Stripe Checkout (hosted payment page). For a more integrated experience, consider implementing Stripe Payment Element in the app using `@stripe/stripe-react-native`.

