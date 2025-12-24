# FeatureValidate

Validate your next feature idea in minutes with instant verdicts, transparent evidence, and actionable validation sprint plans.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- OpenAI API key
- Firebase project

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your API keys
# See .env.example for required variables
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Environment Variables

**⚠️ Important:** Never commit `.env.local` to Git!

Copy `.env.example` to `.env.local` and fill in your values:

```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

See `.env.example` for the complete template.

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard (Settings → Environment Variables)
4. Deploy!

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

## 🔒 Security

- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ `.env.example` shows required variables (safe to commit)
- ✅ API keys set via environment variables
- ✅ No secrets in code or repository

## 📚 Documentation

- `VERCEL_DEPLOYMENT.md` - Deploy to Vercel guide
- `SETUP_INSTRUCTIONS.md` - Initial setup guide
- `ENV_SETUP_GUIDE.md` - Environment variables setup

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Firebase Firestore
- **AI:** OpenAI GPT-4
- **Language:** TypeScript

## 📄 License

See LICENSE file for details.
