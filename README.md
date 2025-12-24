# FeatureValidate

Validate your next feature idea in minutes with instant verdicts, transparent evidence, and actionable validation sprint plans.

## Setup

⚠️ **IMPORTANT**: If you see `'npm' is not recognized`, you need to install Node.js first. See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed setup steps.

### 1. Install Node.js

Download and install Node.js from https://nodejs.org/ (LTS version recommended). After installation, **restart your terminal**.

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database (start in test mode for MVP)
3. Copy your Firebase config values to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Instant Verdict**: Get BUILD / RISKY / DON'T BUILD recommendations with confidence levels
- **Transparent Evidence**: See methodology, assumptions, and limitations
- **Pivot Suggestions**: Get 2-3 refined options with smaller MVP scopes
- **Validation Sprint Plans**: Generate ready-to-run tests, surveys, and outreach templates

## Project Structure

```
app/
  page.tsx              # Landing page
  new/page.tsx          # Intake form
  s/[id]/page.tsx       # Results page
  api/llm/              # LLM API routes
lib/
  firebase/             # Firebase configuration
  llm/                  # LLM schemas and prompts
  domain/               # Domain types and placeholders
components/
  ui/                   # Reusable UI components
  *.tsx                 # Feature-specific components
```

## Notes

- External APIs (Google Trends, Reddit, competitor search) are placeholders for MVP
- LLM uses structured outputs with Zod schemas for reliable JSON responses
- Firestore stores submissions and sprint plans
- Auth is optional (currently supports anonymous sign-in)

