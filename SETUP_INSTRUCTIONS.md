# Setup Instructions for FeatureValidate

## Step 1: Install Node.js

You need to install Node.js first (which includes npm). 

### Option A: Download from Official Website (Recommended)
1. Go to https://nodejs.org/
2. Download the **LTS (Long Term Support)** version for Windows
3. Run the installer and follow the installation wizard
4. Make sure to check the box that says "Add to PATH" during installation
5. Restart your terminal/PowerShell after installation

### Option B: Using Chocolatey (if you have it)
```powershell
choco install nodejs-lts
```

### Verify Installation
After installation, close and reopen your terminal, then run:
```powershell
node --version
npm --version
```

Both commands should show version numbers (e.g., v20.x.x and 10.x.x).

## Step 2: Install Project Dependencies

Once Node.js is installed, navigate to the project directory and run:

```powershell
npm install
```

This will install all required packages:
- Next.js
- React
- Firebase
- OpenAI
- Zod
- Tailwind CSS
- And all other dependencies

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the project root
2. Add the following variables (get values from OpenAI and Firebase):

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Getting OpenAI API Key:
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Create a new API key
4. Copy it to `.env.local`

### Getting Firebase Config:
1. Go to https://console.firebase.google.com/
2. Create a new project (or use existing)
3. Go to Project Settings (gear icon) → General
4. Scroll down to "Your apps" and click the web icon (</>)
5. Register your app and copy the config values to `.env.local`

## Step 4: Set Up Firebase Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in **test mode** for MVP (you can secure it later)
4. Choose a location closest to your users

## Step 5: Run the Development Server

```powershell
npm run dev
```

Open http://localhost:3000 in your browser.

## Troubleshooting

### "npm is not recognized" after installing Node.js
- **Close and reopen your terminal/PowerShell**
- Verify installation: `where.exe node` should show a path
- If still not working, manually add Node.js to PATH:
  - Usually located at: `C:\Program Files\nodejs\`
  - Add to System Environment Variables → Path

### Port 3000 already in use
```powershell
npm run dev -- -p 3001
```

### Firebase errors
- Make sure all environment variables are set correctly
- Check that Firestore is enabled in Firebase Console
- Verify you're using the correct project ID

