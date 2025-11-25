# Firebase Project Initialization Guide

I've created the necessary Firebase configuration files for your project. Now you need to complete the setup:

## Step 1: Find Your Firebase Project ID

You can find your Firebase project ID in several ways:

### Option A: Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your TutorRx project
3. Click the gear icon (⚙️) next to "Project Overview"
4. Go to "Project settings"
5. Copy the **Project ID** (NOT the Project name)

### Option B: From Your Android/iOS Config

- **Android**: Check `android/app/google-services.json` → look for `"project_id"`
- **iOS**: Check `ios/GoogleService-Info.plist` → look for `PROJECT_ID`

### Option C: Use Firebase CLI

```bash
firebase projects:list
```

## Step 2: Update .firebaserc

Open `.firebaserc` and replace `your-firebase-project-id` with your actual project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id-here"
  }
}
```

## Step 3: Login to Firebase CLI

```bash
firebase login
```

## Step 4: Set Firebase Functions Configuration

Set your Stripe secret key:

```bash
firebase functions:config:set stripe.secret_key="YOUR_STRIPE_SECRET_KEY_HERE"
```

**Note:** Replace `YOUR_STRIPE_SECRET_KEY_HERE` with your actual Stripe secret key (starts with `sk_test_` for test mode or `sk_live_` for production).

## Step 5: Install Dependencies in Functions

```bash
cd functions
npm install
```

## Step 6: Build Functions

```bash
npm run build
```

## Step 7: Deploy Functions

From the project root:

```bash
firebase deploy --only functions
```

## Step 8: Deploy Firestore Rules (Optional but Recommended)

```bash
firebase deploy --only firestore:rules
```

## Files Created

I've created the following Firebase configuration files:

- ✅ `firebase.json` - Firebase project configuration
- ✅ `.firebaserc` - Firebase project alias (needs your project ID)
- ✅ `firestore.rules` - Firestore security rules
- ✅ `firestore.indexes.json` - Firestore indexes
- ✅ `functions/` - Cloud Functions directory (already created)

## Troubleshooting

### "Not in a Firebase app directory"

- Make sure you're in the project root directory
- Ensure `.firebaserc` has your correct project ID

### "Permission denied"

- Run `firebase login` to authenticate
- Ensure your account has access to the Firebase project

### "Firebase project not found"

- Double-check your project ID in `.firebaserc`
- Verify the project exists in Firebase Console

### "Billing required"

- Cloud Functions require Firebase Blaze (Pay as you go) plan
- Upgrade in Firebase Console → Usage and billing

## Next Steps After Deployment

1. Copy the deployed function URLs from the terminal output
2. Update `src/config/stripe.config.ts` with those URLs
3. Configure Stripe webhook (see `STRIPE_SETUP.md`)
4. Test the payment flow

---

**Need help?** Check `STRIPE_SETUP.md` for complete setup instructions.
