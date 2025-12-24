# Environment Variables Setup Guide

This guide will help you set up your `.env.local` file with all required API keys and configuration.

## Step 1: Create .env.local File

Create a file named `.env.local` in the root of your project (same folder as `package.json`).

## Step 2: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in with your OpenAI account (create one if needed)
3. Click "Create new secret key"
4. Give it a name (e.g., "FeatureValidate")
5. **Copy the key immediately** (you won't be able to see it again!)
6. Paste it into your `.env.local` file

## Step 3: Set Up Firebase Project

### 3a. Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Enter project name: `feature-validate` (or any name you prefer)
4. (Optional) Disable Google Analytics for MVP
5. Click "Create project"
6. Wait for project creation to complete

### 3b. Register Web App

1. In your Firebase project, click the web icon (`</>`) or "Add app" → Web
2. Register your app:
   - App nickname: `FeatureValidate` (or any name)
   - **Do NOT check** "Also set up Firebase Hosting" for now
3. Click "Register app"
4. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 3c. Enable Firestore Database

1. In Firebase Console, go to "Firestore Database" (left sidebar)
2. Click "Create database"
3. Choose "Start in test mode" (for MVP - you can secure it later)
4. Click "Next"
5. Choose a location (select closest to you or your users)
6. Click "Enable"

### 3d. Copy Firebase Config Values

Copy each value from the Firebase config object to your `.env.local` file.

## Step 4: Create Your .env.local File

Create `.env.local` in your project root with this template:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**Replace all the placeholder values with your actual keys!**

## Step 5: Verify Setup

After creating `.env.local`, restart your development server if it's running:

```powershell
# Stop the server (Ctrl+C if running)
npm run dev
```

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to git (it's already in `.gitignore`)
- Never share your API keys publicly
- OpenAI API keys have usage limits and costs - monitor usage
- Firebase test mode allows anyone with your config to read/write - secure it in production

## Troubleshooting

### "Invalid API key" error
- Make sure your OpenAI API key starts with `sk-`
- Check that there are no extra spaces or quotes in `.env.local`
- Restart your dev server after changing `.env.local`

### Firebase connection errors
- Verify all Firebase values are correct (no typos)
- Make sure Firestore is enabled in Firebase Console
- Check that you're using the correct project ID
- All Firebase env vars must start with `NEXT_PUBLIC_` (required for client-side access)

### Can't find Firebase config
- Go to Firebase Console → Project Settings (gear icon) → General
- Scroll to "Your apps" section
- Click on your web app to see the config

