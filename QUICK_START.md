# Quick Start Guide

## ✅ Step 1: Install Dependencies (Already Done!)
Dependencies are installed. If you need to reinstall:
```powershell
npm install
```

## ⏳ Step 2: Set Up Environment Variables

### Option A: Quick Setup Script

I can help you create the `.env.local` file. You'll need:

1. **OpenAI API Key** - Get from https://platform.openai.com/api-keys
2. **Firebase Config** - Get from Firebase Console (see detailed guide below)

### Option B: Manual Setup

1. Copy `.env.local.template` to `.env.local`
2. Fill in your values
3. See `ENV_SETUP_GUIDE.md` for detailed instructions

## 🚀 Step 3: Run the App

Once `.env.local` is set up:

```powershell
npm run dev
```

Then open http://localhost:3000 in your browser.

---

## Getting Your Keys (Quick Reference)

### OpenAI API Key (2 minutes)
1. Go to https://platform.openai.com/api-keys
2. Sign in / Create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Firebase Config (5 minutes)
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Click web icon `</>` to register web app
4. Copy the config values
5. Enable Firestore Database → Start in test mode

See `ENV_SETUP_GUIDE.md` for step-by-step instructions with screenshots guidance.

