# How to Run the App

## ⚠️ PowerShell Execution Policy Issue

If you're getting the PowerShell execution policy error, here are your options:

### ✅ Option 1: Use Command Prompt (Easiest!)

1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to project:
   ```
   cd C:\Users\gianm\Desktop\Everything\Projects\Validate
   ```
4. Run:
   ```
   npm run dev
   ```

**Command Prompt doesn't have execution policy restrictions!**

### Option 2: Bypass PowerShell Policy for Current Session

In your PowerShell window, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

Then run:
```powershell
npm run dev
```

### Option 3: Use Full Path to npm.cmd

```powershell
& "C:\Program Files\nodejs\npm.cmd" run dev
```

---

## Before Running: Get Firebase API Key

You still need to add your `NEXT_PUBLIC_FIREBASE_API_KEY` to `.env.local`:

1. Go to https://console.firebase.google.com/
2. Select your project: `validatefeature`
3. Go to Project Settings (gear icon) → General tab
4. Scroll to "Your apps" section
5. Click on your web app
6. Find the `apiKey` value in the config (starts with `AIza...`)
7. Edit `.env.local` and replace `YOUR_FIREBASE_API_KEY` with the actual key

Or you can find it in the Firebase config object:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",  // ← This is what you need!
  // ... rest of config
};
```

---

## After Setup

Once `.env.local` is complete with all values, run:

```powershell
# In Command Prompt (recommended) or PowerShell
npm run dev
```

Then open http://localhost:3000 in your browser! 🚀

