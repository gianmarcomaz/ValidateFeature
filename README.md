# Validate

AI-powered feature validation tool that helps founders validate feature ideas with instant verdicts (Build/Risky/Don't Build), transparent evidence, pivot suggestions, and actionable validation sprint plans.

## 📋 Table of Contents

- [How It Works](#how-it-works)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Firebase Configuration](#firebase-configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Architecture & Data Flow](#architecture--data-flow)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Testing & Debugging](#testing--debugging)
- [Troubleshooting](#troubleshooting)
- [Tech Stack](#tech-stack)

---

## How It Works

### Application Flow

1. **Landing Page** (`/`) - User sees overview and clicks "Validate a Feature"
2. **Intake Form** (`/new`) - User enters:
   - Mode: Early-stage founder or Existing startup
   - Feature title and description
   - Target user (ICP): role, industry, company size
   - Goal metric: activation, retention, revenue, or support reduction
3. **Processing** - App:
   - Authenticates user anonymously via Firebase
   - Creates submission in Firestore (status: `draft`)
   - Calls `/api/llm/normalize` to normalize the feature description
   - Stores normalized data
   - Calls `/api/llm/verdict` to generate verdict
   - Stores verdict and updates status to `verdict_ready`
4. **Results Page** (`/s/[id]`) - Displays:
   - Verdict badge (BUILD/RISKY/DON'T BUILD) with confidence level
   - Detailed reasons (3-6 bullets)
   - Pivot/refine suggestions (2-3 options)
   - Transparency panel (assumptions, limitations, methodology)
   - Optional: "Generate Validation Sprint" button
5. **Sprint Generation** (optional):
   - Calls `/api/llm/sprint` to generate validation plan
   - Stores sprint in subcollection `submissions/{id}/sprints/{sprintId}`
   - Updates submission status to `sprint_ready`
   - Displays tests, survey questions, and outreach templates

### Key Features

- **Instant Verdicts**: AI-powered analysis with BUILD/RISKY/DON'T BUILD recommendations
- **Transparent Evidence**: Shows methodology, assumptions, and limitations
- **Pivot Suggestions**: Alternative approaches if verdict is risky/don't build
- **Validation Sprint Plans**: Ready-to-run tests, surveys, and outreach templates
- **Anonymous Auth**: No sign-up required - uses Firebase anonymous authentication
- **Persistent Storage**: All submissions stored in Firestore with proper status tracking

---

## Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Firebase project ([Create one here](https://console.firebase.google.com/))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Validate

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your API keys (see Environment Setup below)
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
Validate/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── new/page.tsx              # Feature intake form
│   ├── s/[id]/page.tsx           # Results page (dynamic route)
│   ├── debug/page.tsx            # Development health checks
│   ├── api/llm/                  # API routes (server-side)
│   │   ├── normalize/route.ts    # Normalize feature description
│   │   ├── verdict/route.ts      # Generate verdict
│   │   └── sprint/route.ts       # Generate validation sprint
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles + Tailwind
│
├── components/                   # React components
│   ├── IntakeForm.tsx            # Feature input form
│   ├── VerdictView.tsx           # Verdict display
│   ├── PivotOptions.tsx          # Pivot suggestions
│   ├── TransparencyPanel.tsx     # Methodology disclosure
│   ├── SprintPlanView.tsx        # Sprint plan display
│   └── ui/                       # Reusable UI components
│       ├── Badge.tsx             # Status badges
│       ├── Card.tsx              # Card container
│       ├── Section.tsx           # Section wrapper
│       └── Spinner.tsx           # Loading spinner
│
├── lib/                          # Core library code
│   ├── firebase/
│   │   ├── client.ts             # Firebase initialization
│   │   ├── auth.ts               # Anonymous auth helper
│   │   └── db.ts                 # Firestore operations
│   ├── llm/
│   │   ├── schemas.ts            # Zod schemas for LLM responses
│   │   └── prompts.ts            # Prompt templates
│   ├── evidence/                 # Evidence gathering module
│   │   ├── types.ts              # Evidence types
│   │   ├── googleCse.ts          # Google CSE integration
│   │   ├── hackerNews.ts         # Hacker News API integration
│   │   ├── normalize.ts          # Normalize evidence from sources
│   │   ├── signals.ts            # Compute evidence signals
│   │   └── keywords.ts           # Keyword derivation
│   └── domain/
│       ├── types.ts              # TypeScript types
│       ├── signals.ts            # External API placeholders
│       └── scoring.ts            # Scoring logic (placeholder)
│
├── firestore.rules               # Firestore security rules
├── firebase.json                 # Firebase configuration
├── tailwind.config.ts            # Tailwind CSS config
├── postcss.config.mjs            # PostCSS config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies & scripts
```

---

## Environment Setup

### Required Environment Variables

Create `.env.local` in the root directory:

```env
# OpenAI API Key (Server-side only - never exposed to client)
OPENAI_API_KEY=sk-...

# Firebase Configuration (Client-side - prefixed with NEXT_PUBLIC_ for validatefeature)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789

# Serper.dev Search (Optional - for evidence gathering)
SERPER_API_KEY=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Serper.dev Search (Optional - for evidence gathering)
SERPER_API_KEY=...
```

**⚠️ Important:** Never commit `.env.local` to Git! It's already in `.gitignore`.

### Getting Your API Keys

#### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (you won't see it again!)
5. Paste into `OPENAI_API_KEY` in `.env.local`

#### Firebase Configuration (validatefeature)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or select existing)
3. Go to Project Settings (gear icon) → General
4. Scroll to "Your apps" → Web app (`</>` icon)
5. Register app if not already done
6. Copy the config object values to `.env.local`

#### Serper.dev Search (Optional)

**Note:** Evidence gathering works without Serper.dev, but verdicts will note that external evidence was not available.

1. Go to [Serper.dev](https://serper.dev)
2. Sign up or log in
3. Create an API key from the dashboard
4. Add `SERPER_API_KEY` to `.env.local`

---

## Firebase Configuration

### Initial Setup

1. **Create Firestore Database:**
   - Firebase Console → Firestore Database
   - Click "Create database"
   - Choose "Start in production mode" (or test mode for MVP)
   - Select location closest to users
   - Click "Enable"

2. **Enable Anonymous Authentication:**
   - Firebase Console → Authentication
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Click "Anonymous"
   - Enable it
   - Save

3. **Deploy Security Rules:**
   - Option A: Via Firebase Console (easiest)
     - Firebase Console → Firestore Database → Rules
     - Copy contents of `firestore.rules`
     - Paste into rules editor
     - Click "Publish"
   - Option B: Via CLI
     ```bash
     firebase login
     firebase init firestore
     firebase deploy --only firestore:rules
     ```

### Security Rules

The `firestore.rules` file enforces:
- All operations require authentication
- Users can only read/write their own submissions (`userId == request.auth.uid`)
- Sprint subcollection follows parent submission permissions

---

## Development

### Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Development Workflow

1. **Make Changes:**
   - Edit files in `app/`, `components/`, or `lib/`
   - Changes auto-reload (hot reload enabled)

2. **Test Locally:**
   - Visit `/debug` for health checks
   - Test full flow: `/new` → submit → `/s/[id]`
   - Check browser console for errors
   - Check Firebase Console for data writes

3. **Debug Issues:**
   - `/debug` page shows:
     - Tailwind CSS status
     - Environment variables (without secrets)
     - Firebase integration tests
     - API route health
   - Check browser Network tab for API calls
   - Check Firebase Console for Firestore operations

---

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables:**
   - In Vercel project settings → Environment Variables
   - Add all variables from `.env.local`:
     - `OPENAI_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - Set for all environments (Production, Preview, Development)

4. **Deploy:**
   - Vercel auto-deploys on push
   - Or click "Deploy" manually

5. **Verify:**
   - Visit your Vercel URL
   - Test full flow
   - Check `/debug` page (production mode will show "disabled")

### Other Deployment Options

- **Netlify:** Similar to Vercel, supports Next.js
- **Self-hosted:** Use `npm run build` then `npm start`
- **Firebase Hosting:** Can host Next.js with custom configuration

---

## Architecture & Data Flow

### Frontend → Backend Flow

```
User submits form (/new)
  ↓
ensureAnonymousAuth() → Firebase Auth (anonymous)
  ↓
createSubmission() → Firestore (status: "draft")
  ↓
POST /api/llm/normalize → OpenAI GPT-4o → NormalizedFeature
  ↓
updateSubmissionNormalized() → Firestore
  ↓
POST /api/llm/verdict → OpenAI GPT-4o → VerdictResponse
  ↓
updateSubmissionVerdict() → Firestore (status: "verdict_ready")
  ↓
Redirect to /s/[id] → Display results
```

### LLM Processing

All LLM calls use **OpenAI Structured Outputs** with JSON Schema validation:
- Ensures valid JSON responses every time
- Uses GPT-4o model for quality
- Validates with Zod schemas before returning
- Handles errors gracefully

### Data Persistence

- **Firestore Collections:**
  - `submissions/{submissionId}` - Main submission documents
  - `submissions/{submissionId}/sprints/{sprintId}` - Sprint plans (subcollection)

- **Status Lifecycle:**
  - `draft` → Created via `createSubmission()`
  - `verdict_ready` → Set via `updateSubmissionVerdict()`
  - `sprint_ready` → Set via `createSprint()`

---

## Database Schema

### Collection: `submissions/{submissionId}`

```typescript
{
  createdAt: Timestamp,
  updatedAt: Timestamp,
  userId: string | null,              // Firebase anonymous auth UID
  mode: "early" | "existing",
  featureTitle: string,
  featureDescription: string,
  icpRole: string,
  icpIndustry?: string,
  companySize?: string,
  goalMetric: "activation" | "retention" | "revenue" | "support",
  normalized?: {
    problemStatement: string,
    targetUserSummary: string,
    successMetricDefinition: string,
    keywordQuerySet: string[],
    clarifyingQuestions: string[]
  },
  signals?: {
    trends: { status: "TODO" | "complete" },
    community: { status: "TODO" | "complete" },
    competitors: { status: "TODO" | "complete" }
  },
  verdict?: {
    verdict: "BUILD" | "RISKY" | "DONT_BUILD",
    confidence: "HIGH" | "MEDIUM" | "LOW",
    reasons: Array<{ title: string, detail: string }>,
    pivotOptions: Array<{ name, description, whyStronger, smallestMVP }>,
    transparency: { assumptions, limitations, methodology },
    generatedAt: Timestamp
  },
  status: "draft" | "verdict_ready" | "sprint_ready"
}
```

### Subcollection: `submissions/{submissionId}/sprints/{sprintId}`

```typescript
{
  createdAt: Timestamp,
  generatedAt: Timestamp,
  plan: {
    tests: Array<{
      type: "fake-door" | "micro-poll" | "waitlist" | "interview",
      steps: string[],
      successThreshold: string
    }>,
    survey: {
      intro: string,
      questions: Array<{
        question: string,
        type: "text" | "multiple-choice" | "scale" | "boolean",
        options?: string[],
        required: boolean
      }>
    },
    outreachTemplates: Array<{
      platform: "linkedin" | "email",
      subject?: string,
      body: string
    }>
  }
}
```

---

## API Routes

All API routes are server-side only (never exposed to client).

### `POST /api/llm/normalize`

**Input:**
```json
{
  "mode": "early" | "existing",
  "feature": { "title": string, "description": string },
  "icp": { "role": string, "industry?": string, "companySize?": string },
  "goalMetric": "activation" | "retention" | "revenue" | "support"
}
```

**Output:** `NormalizedFeature` (validated JSON)

### `POST /api/llm/verdict`

**Input:**
```json
{
  ...submissionInput,
  "normalized": NormalizedFeature
}
```

**Input:**
```json
{
  ...submissionInput,
  "normalized": NormalizedFeature,
  "evidence?": NormalizedEvidence  // Optional - if missing, verdict still works with lower confidence
}
```

**Output:** `VerdictResponse` (validated JSON)

**Note:** If `evidence` is provided, the verdict will reference external findings (competitors, pain signals, recency). If missing, confidence is typically lowered and methodology notes the absence of external evidence.

### `POST /api/evidence/search`

**Input:**
```json
{
  "query": string,
  "keywords?": string[]
}
```

**Output:**
```json
{
  "evidence": NormalizedEvidence
}
```

**What it does:**
- Searches Google CSE with multiple queries (software, tool, alternative, pricing, problem)
- Searches Hacker News via Algolia API
- Normalizes results and computes signals (competitor_density, recency_score, pain_signal, overall_evidence_score)
- Returns top citations and evidence summary

**Note:** 
- **Hacker News**: FREE, NO API KEY REQUIRED - Uses public Algolia API
- **Google CSE**: REQUIRES API KEYS - Must set `GOOGLE_CSE_API_KEY` and `GOOGLE_CSE_CX` in environment
- If Google CSE is not configured, the app will still work but only use Hacker News data
- There is NO CLI or alternative way to use Google CSE without API keys - it's a paid Google service

**To test if APIs are working:**
- Visit `/api/test-evidence` in your browser to see which APIs are configured and working

### `POST /api/llm/sprint`

**Input:**
```json
{
  "verdict": VerdictResponse,
  "normalized": NormalizedFeature,
  "feature": { "title": string, "description": string }
}
```

**Output:** `ValidationSprint` (validated JSON)

**Error Handling:**
- All routes return JSON with `{ error: string, details?: string }`
- Status codes: 400 (bad request), 500 (server error)
- Validates OpenAI API key presence
- Validates input schemas

---

## Testing & Debugging

### Debug Page (`/debug`)

Available in development mode only. Shows:
- ✅ Tailwind CSS status
- ✅ Environment variables (without secrets)
- ✅ Firebase integration tests:
  - Anonymous auth
  - Write (create submission)
  - Read (get submission)
  - Sprint subcollection
- ✅ API route health

### Evidence Integration Verification

To verify evidence is working correctly:

1. **Set Environment Variables:**
   ```bash
   # Required for evidence gathering
   SERPER_API_KEY=your_key_here
   ```

2. **Submit a Feature:**
   - Go to `/new`
   - Enter a feature like: "Automate resume checking and verification + ATS-friendly enhancement"
   - Submit the form

3. **Check Evidence Collection:**
   - In browser console, look for `[Form] Evidence received:` log
   - In terminal, look for `[Evidence]` logs showing:
     - `googleConfigured=true/false`
     - `googleItems=X`
     - `hnHits=X`
     - `competitors=X`
     - `warnings=X`

4. **Verify Results Page (`/s/[id]`):**
   - **Evidence Metrics section** should show:
     - Market status (Established/Unclear)
     - Competitor count
     - Evidence signals with progress bars
     - **Inline evidence** under each metric:
       - Competitor Density: Top 3 competitors with links + snippets
       - Pain Signal: 2-3 pain indicators from search results
       - Recency: Recent HN hits with dates
       - Evidence Coverage: Counts + sample citations
     - References section with 5-10 citations
     - Warnings banner if Google CSE not configured

5. **Check Firestore:**
   - Open Firebase Console → Firestore
   - Find submission document in `submissions/{id}`
   - Verify `evidence` field contains:
     - `google: { configured, queries: [...] }`
     - `hackernews: { hits: [...] }`
     - `competitors: [...]`
     - `signals: { perMetricEvidence: {...} }`
     - `warnings: [...]` (if applicable)

6. **Verify Verdict Uses Evidence:**
   - Verdict should reference actual competitors found
   - If competitors.length >= 3, verdict should acknowledge market is established
   - If evidenceCoverage < 30, confidence should be LOW/MEDIUM
   - Competitor Analysis should list real competitors with links

7. **Test Without Serper.dev:**
   - Remove `SERPER_API_KEY` from `.env.local`
   - Submit a feature
   - Should see warning banner that external search is not configured
   - Evidence should still show HN results
   - Verdict should note limited evidence

### Debug Mode

To see raw evidence JSON on results page:
1. Add to `.env.local`: `NEXT_PUBLIC_DEBUG_EVIDENCE=true`
2. Restart dev server
3. Results page will show "Debug: Raw Evidence JSON" toggle

### Manual Testing Checklist

1. **Environment:**
   - [ ] All env vars present (check `/debug`)
   - [ ] No console errors on page load

2. **Firebase:**
   - [ ] Anonymous auth enabled in Firebase Console
   - [ ] Security rules deployed
   - [ ] Firestore database created

3. **Full Flow:**
   - [ ] Navigate to `/new`
   - [ ] Fill out form completely
   - [ ] Submit form
   - [ ] Verify redirect to `/s/[id]`
   - [ ] Verify verdict displays
   - [ ] Click "Generate Validation Sprint"
   - [ ] Verify sprint plan displays

4. **Firestore Console:**
   - [ ] Check `submissions` collection has document
   - [ ] Verify schema matches (flat fields, not nested)
   - [ ] Verify `status` field updates correctly
   - [ ] Check `sprints` subcollection exists

---

## Troubleshooting

### Firebase Issues

**Error: "Firebase not initialized"**
- Check `.env.local` has all `NEXT_PUBLIC_FIREBASE_*` vars
- Restart dev server after adding env vars
- Check browser console for specific missing var

**Error: "Permission denied"**
- Verify Anonymous Auth is enabled in Firebase Console
- Verify security rules are deployed
- Check rules match your Firebase project

**Error: "Failed to authenticate"**
- Check Anonymous Auth is enabled
- Clear browser cache/localStorage
- Check Firebase Console → Authentication → Users

### API Route Issues

**Error: "OpenAI API key missing"**
- Check `OPENAI_API_KEY` in `.env.local`
- Restart dev server after adding key
- Verify key starts with `sk-`

**Error: "Failed to generate verdict"**
- Check OpenAI API key is valid
- Check API quota/billing in OpenAI dashboard
- Review server logs for detailed error

### UI/Styling Issues

**Styles not applying:**
- Check `/debug` page for Tailwind status
- Hard refresh browser (Ctrl+Shift+R)
- Clear `.next` cache: `rm -rf .next` then `npm run dev`
- Verify `globals.css` imports Tailwind directives

**Dark theme not showing:**
- Check `app/layout.tsx` has dark gradient classes on body
- Verify Tailwind config includes `app/` in content paths

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS 3.4+ with custom dark theme
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Anonymous Auth
- **AI/LLM:** OpenAI GPT-4o with Structured Outputs
- **Validation:** Zod schemas for type-safe validation
- **Deployment:** Vercel (recommended) or any Next.js-compatible host

### Key Dependencies

```json
{
  "next": "^14.2.35",
  "react": "^18",
  "firebase": "^11.1.0",
  "openai": "^4.20.1",
  "zod": "^3.22.4",
  "tailwindcss": "^3.4.19"
}
```

---

## Management & Control

### Environment Management

- **Local Development:** Use `.env.local` (gitignored)
- **Production:** Set in Vercel dashboard or hosting provider
- **Never commit:** `.env.local` is in `.gitignore`

### Firebase Management

- **View Data:** Firebase Console → Firestore Database
- **Monitor Usage:** Firebase Console → Usage & Billing
- **Update Rules:** Edit `firestore.rules`, deploy via Console or CLI
- **Manage Auth:** Firebase Console → Authentication

### Deployment Management

- **Vercel:** Automatic deployments on push to main branch
- **Manual Deploy:** Push to GitHub, Vercel auto-detects
- **Preview Deployments:** Created for PRs automatically
- **Rollback:** Vercel dashboard → Deployments → Rollback

### Code Management

- **Main Branch:** Production-ready code
- **Feature Branches:** Use for new features
- **Hot Fixes:** Fix directly on main if urgent

---

## License

See LICENSE file for details.

---

## How to Verify

This section covers verification steps for the upgraded app with startup context + feature context validation.

### Website Auto-fill Verification

1. **Test Website Ingestion:**
   - Go to `/new`
   - Select "Website Link (Auto-fill)" tab
   - Enter a startup website URL (e.g., `https://example.com`)
   - Click "Auto-fill"
   - Verify form fields populate with extracted data:
     - Startup name
     - Description
     - What it does
     - Problem solved
     - Target audience
   - Verify fields are editable after auto-fill

2. **Check Firestore Document:**
   - Submit the form
   - Open Firebase Console → Firestore
   - Find the submission document
   - Verify `startup` field contains:
     - `source: "website"`
     - `websiteUrl: "https://example.com"`
     - `name`, `description`, `whatItDoes`, `problemSolved`, `targetAudience`
     - `websiteEvidence.pages[]` with fetched pages
     - `websiteEvidence.fetchedAt` timestamp

3. **Test Manual Entry:**
   - Go to `/new`
   - Select "Manual" tab
   - Fill in startup context manually
   - Submit and verify `startup.source: "manual"` in Firestore

### Startup + Feature Context Verification

1. **Verify Submission Structure:**
   - After submitting, check Firestore document has:
     - `startup` object (if provided)
     - `feature` object with `title`, `description`, `problemSolved`, `targetAudience`
     - Legacy fields (`featureTitle`, `featureDescription`) for backward compatibility

2. **Verify Evidence Uses Context:**
   - Check server logs for evidence search queries
   - Queries should include startup name, target audience, problem solved
   - Queries should include feature-specific terms
   - Evidence should be more precise than before

3. **Verify Verdict Uses Context:**
   - Check verdict reasons reference startup context when available
   - If startup context incomplete, limitations should mention it
   - Verdict should not invent startup facts (should say "unknown" if not provided)

### Evaluation Page Verification

1. **Startup Context Panel:**
   - Navigate to `/s/[id]` for a submission with startup context
   - Verify "Startup Context" panel appears near top
   - Verify it shows:
     - Name, description, what it does, problem solved, target audience
     - Website URL (if website mode) with clickable link
     - List of ingested pages (if website mode)

2. **Evidence Links in Reasons:**
   - Check each reason card
   - Verify "Evidence used" section shows 2-4 citations
   - Citations should have:
     - Clickable links
     - Source badges (google/hackernews/website)
     - Snippets (first 150 chars)
   - If no evidence, verify warning message appears

3. **Enhanced Pivot Options:**
   - Check pivot options cards
   - Verify they show (if provided):
     - Who to target
     - What to build/change
     - Week-1 experiment
     - Success metric
     - Smallest MVP

4. **Improved Transparency Panel:**
   - Expand "Sources" section
   - Verify it shows:
     - Website evidence pages (if website mode)
     - Top Google citations (5 max)
     - Top HN citations (5 max)
   - Expand "Warnings & Coverage" section (if applicable)
   - Verify warnings for:
     - Low evidence coverage (< 30)
     - Google CSE not configured
     - Other evidence issues
   - Expand "Methodology" section
   - Verify "How metrics are computed" subsection appears

### Backward Compatibility Verification

1. **Old Submissions Still Work:**
   - Create a submission without startup context (legacy flow)
   - Verify it still works end-to-end
   - Results page should handle missing `startup` and `feature` fields gracefully
   - Should fall back to `featureTitle` and `featureDescription`

2. **Mixed Data:**
   - Verify app handles submissions with:
     - Only legacy fields
     - Only new fields
     - Both (should prefer new fields)

### Evidence Quality Verification

1. **Check Evidence Citations:**
   - Verify evidence includes `citations[]` array
   - Each citation should have: `title`, `url`, `snippet`, `source`
   - Citations should be from actual search results, not invented

2. **Check Competitor Analysis:**
   - Verify `competitorAnalysis` in verdict references actual competitors from evidence
   - Competitor links should be real URLs from search results
   - Should not include hypothetical competitors

3. **Check Warnings:**
   - If evidence coverage < 30, verify warning appears
   - If Google CSE not configured, verify warning appears
   - Warnings should be explicit, not hidden

### Non-Hallucination Verification

1. **Missing Evidence:**
   - Submit a feature with no evidence (or very low coverage)
   - Verify verdict says "unknown" for missing facts
   - Verify confidence is LOW or MEDIUM (not HIGH)
   - Verify limitations mention missing evidence

2. **Missing Startup Context:**
   - Submit without startup context
   - Verify verdict doesn't invent startup facts
   - Verify limitations mention incomplete startup context

3. **Competitor Claims:**
   - If evidence shows 0 competitors, verdict can say "no competitors found"
   - If evidence shows 3+ competitors, verdict MUST acknowledge them
   - Verdict should never claim "no competitors" if evidence shows otherwise

### Integration Stability Verification

1. **Existing Flows:**
   - Verify normalize API still works
   - Verify verdict API still works
   - Verify sprint generation still works
   - Verify Firestore writes succeed
   - Verify no breaking changes to existing submissions

2. **Error Handling:**
   - Test with invalid website URL (should show error)
   - Test with unreachable website (should show warning)
   - Test with SSRF attempt (localhost, private IP) - should be blocked
   - Test with missing OpenAI key - should show clear error

---

## Support

For issues or questions:
1. Check `/debug` page for diagnostics
2. Review this README's Troubleshooting section
3. Check browser console and server logs
4. Verify all environment variables are set correctly
