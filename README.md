# TutorRx - AI Nursing Tutor Mobile App

A React Native mobile application for NCLEX exam preparation with AI-powered tutoring, practice questions, flashcards, and study plans.

## Features

- 🔐 Authentication (Email/Password, Google Sign-In)
- 💬 AI Tutor Chat (OpenAI integration)
- 📝 NCLEX Practice Questions
- 🎴 Flashcards with progress tracking
- 📅 AI Study Plan Generator
- 🏥 Clinical Scenario Generator (Premium)
- 💎 Premium Subscription (Stripe)
- 🌓 Dark/Light Mode
- ✨ Glassmorphism UI

## Tech Stack

- **React Native** (Bare workflow, TypeScript)
- **Firebase** (Auth, Firestore, Storage)
- **OpenAI API** (GPT-4o-mini)
- **Stripe** (Subscriptions)
- **Zustand** (State management)
- **React Navigation** (Navigation)
- **React Hook Form + Zod** (Form validation)

## Project Structure

```
src/
├── assets/
│   ├── fonts/          # Raleway font files
│   ├── images/
│   └── icons/
├── components/
│   ├── common/         # GlassContainer, Button, Card, TextInput, Loading
│   ├── auth/
│   ├── questions/
│   ├── flashcards/
│   └── chat/
├── screens/
│   ├── Auth/           # Login, SignUp, ForgotPassword (with .styles.ts)
│   ├── Home/           # HomeScreen (with .styles.ts)
│   ├── Chat/
│   ├── Questions/
│   ├── Flashcards/
│   ├── StudyPlan/
│   ├── Scenarios/
│   ├── Premium/
│   ├── Profile/
│   ├── Settings/
│   └── History/
├── navigation/         # AppNavigator, AuthNavigator, MainNavigator
├── services/
│   ├── firebase/       # auth, firestore, storage
│   ├── openai/         # tutor, studyPlan, scenarios
│   └── stripe/         # subscriptions
├── store/              # Zustand stores (theme, auth)
├── hooks/              # Custom hooks (useTheme, useAuth)
├── theme/              # Colors, typography, spacing, shadows, glassmorphism
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── constants/          # Firebase, OpenAI, Stripe configs
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Add `google-services.json` to `android/app/`
2. Add `GoogleService-Info.plist` to `ios/`
3. Update Firebase config in `src/constants/firebase.ts`

### 3. Configure OpenAI

Add your OpenAI API key to `src/constants/openai.ts`:
```typescript
export const OPENAI_API_KEY = 'your-api-key-here';
```

### 4. Configure Stripe

Add your Stripe publishable key to `src/constants/stripe.ts`:
```typescript
export const STRIPE_PUBLISHABLE_KEY = 'your-publishable-key-here';
```

### 5. Link Assets

```bash
npx react-native-asset
```

### 6. Run on iOS

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

### 7. Run on Android

```bash
npx react-native run-android
```

## Bundle ID

- iOS: `com.tutorrx.nclextutor`
- Android: `com.tutorrx.nclextutor`

## Key Features Implemented

✅ Project initialization with TypeScript
✅ Bundle ID configuration
✅ Module resolver with path aliases
✅ Raleway font integration
✅ Complete theme system (light/dark mode)
✅ Glassmorphism UI components
✅ Firebase service layer
✅ Navigation structure
✅ Authentication screens
✅ HomeScreen with feature cards

## Remaining Features

- AI Tutor Chat screen
- NCLEX Questions module
- Flashcards module
- Study Plan Generator
- Clinical Scenario Generator
- Premium/Stripe integration screens
- Profile & Settings screens
- History screen

## Development

The app uses:
- **Path aliases** (`@components/`, `@screens/`, etc.)
- **Separate style files** for each screen (`.styles.ts`)
- **TypeScript** throughout
- **Raleway font** for all text
- **Glassmorphism** UI design

## License

Private - All rights reserved
