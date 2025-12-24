# Deploy to Vercel with Environment Variables

## ✅ Current Setup (Secure)

Your repository is already configured correctly:
- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ `.env.example` shows what variables are needed (safe to commit)
- ✅ No real API keys in the repository

## 🔒 How Environment Variables Work

### Local Development
- Use `.env.local` file (NOT committed to Git)
- Contains your real API keys
- Only exists on your computer

### Production (Vercel)
- Set environment variables in Vercel dashboard
- Never in code or Git
- Secure and encrypted by Vercel

## 📤 Deploy to Vercel

### Step 1: Push Your Code

First, make sure your code is on GitHub (which it is):

```powershell
git add .
git commit -m "Add .env.example and remove template files with keys"
git push origin main
```

### Step 2: Connect to Vercel

1. **Go to:** https://vercel.com
2. **Sign up/Login** (can use GitHub account)
3. **Click "New Project"**
4. **Import your GitHub repository:** `ValidateFeature`
5. **Configure project:**
   - Framework Preset: Next.js (should auto-detect)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### Step 3: Add Environment Variables in Vercel

**Before deploying**, add your environment variables:

1. In Vercel project settings, go to **Settings → Environment Variables**
2. Add each variable:

   ```
   OPENAI_API_KEY = your_openai_api_key_here
   NEXT_PUBLIC_FIREBASE_API_KEY = your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = validatefeature.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID = validatefeature
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = validatefeature.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 494209034180
   NEXT_PUBLIC_FIREBASE_APP_ID = 1:494209034180:web:f593a011968e884fec2691
   ```

3. **Select environments:** Production, Preview, Development (check all)
4. **Click "Save"**

### Step 4: Deploy

1. **Click "Deploy"**
2. Vercel will build and deploy your app
3. Your app will be live at: `https://your-project.vercel.app`

## 🔐 Security Best Practices

### ✅ DO:
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use `.env.example` for documentation (safe to commit)
- ✅ Set environment variables in Vercel dashboard
- ✅ Use different API keys for production if possible

### ❌ DON'T:
- ❌ Commit `.env.local` to Git
- ❌ Put real API keys in code
- ❌ Put API keys in `.env.example`
- ❌ Share API keys publicly

## 📝 Environment Variables Reference

### Required Variables:

| Variable | Where to Get It | Description |
|----------|----------------|-------------|
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys | Your OpenAI API key |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Console | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Console | Your Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Console | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Console | Firebase app ID |

### Note on NEXT_PUBLIC_ prefix:

- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- These are safe for Firebase config (they're meant to be public)
- `OPENAI_API_KEY` does NOT have this prefix (server-side only)

## 🔄 Updating Environment Variables

### To Update in Vercel:
1. Go to Vercel project → Settings → Environment Variables
2. Edit the variable
3. Redeploy (or wait for next deployment)

### To Update Locally:
1. Edit `.env.local` file
2. Restart dev server: `npm run dev`

## ✅ Verification

After deployment, verify:
1. ✅ App loads on Vercel URL
2. ✅ No errors in Vercel logs
3. ✅ API calls work (test the feature validation)
4. ✅ Firebase connection works

## 🐛 Troubleshooting

### "Environment variable not found"
- Check variable names match exactly (case-sensitive)
- Verify variables are set in Vercel dashboard
- Redeploy after adding variables

### "API key invalid"
- Check key is correct in Vercel dashboard
- Verify key hasn't expired
- Check for extra spaces in variable value

### Build fails
- Check Vercel build logs
- Verify all required environment variables are set
- Make sure `package.json` scripts are correct

## 🎉 You're All Set!

Your repository is secure:
- ✅ No API keys in Git
- ✅ `.env.local` is ignored
- ✅ `.env.example` documents what's needed
- ✅ Ready for Vercel deployment with environment variables

