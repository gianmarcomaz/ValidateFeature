# Testing Evidence Integration

This guide walks you through testing the new evidence gathering features.

## Prerequisites

1. **Environment Setup** (Optional but Recommended)
   - Add to `.env.local`:
     ```
    SERPER_API_KEY=your_key_here
     ```
   - If you don't have Google CSE keys, the app will still work but only fetch Hacker News data.

2. **Dependencies Installed**
   ```bash
   npm install
   ```

3. **Development Server Running**
   ```bash
   npm run dev
   ```

---

## Testing Methods

### Method 1: CLI Script (Fastest - Test Evidence Only)

**Command:**
```bash
npm run evidence:probe "your feature idea here"
```

**Example:**
```bash
npm run evidence:probe "AI-powered project management tool for remote teams"
```

**Expected Output:**
```
🔍 Evidence Probe

Query: "AI-powered project management tool for remote teams"

Derived Keywords: powered, project, management, tool, remote, teams

Fetching evidence from Google CSE and Hacker News...

✅ Google CSE: 45 results across 5 queries
✅ Hacker News: 8 stories

📊 Signals:
{
  "competitor_density": 75,
  "recency_score": 65,
  "pain_signal": 58,
  "overall_evidence_score": 68,
  "notes": [
    "Analyzed 45 Google search results and 8 Hacker News stories",
    "High competitor density (75): Found many existing products in this space",
    "Moderate pain signals (58): Some evidence of user needs",
    "Mixed recency (65): Some historical interest, less recent activity"
  ]
}

📚 Top Citations:
1. [GOOGLE] Best Project Management Tools 2024
   https://example.com/project-management-tools
2. [GOOGLE] Remote Team Collaboration Software
   https://example.com/remote-collaboration
...
```

**Files Created:**
- `evidence.sample.json` - Full evidence object saved to root directory

---

### Method 2: API Route Test (Manual Testing)

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/evidence/search \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"AI-powered note-taking app for developers\"}"
```

**Expected Response:**
```json
{
  "evidence": {
    "google": {
      "queries": [
        {
          "q": "AI-powered note-taking app developers software",
          "items": [
            {
              "title": "Best Note-Taking Apps for Developers",
              "snippet": "A comprehensive list of note-taking tools...",
              "link": "https://example.com/apps",
              "displayLink": "example.com"
            }
            // ... more items
          ]
        }
        // ... more queries
      ]
    },
    "hackernews": {
      "hits": [
        {
          "title": "Show HN: AI-powered note app",
          "url": "https://example.com/hn",
          "points": 142,
          "num_comments": 45,
          "created_at": "2024-01-15T10:30:00Z",
          "objectID": "123456"
        }
        // ... more hits
      ]
    },
    "signals": {
      "competitor_density": 60,
      "recency_score": 72,
      "pain_signal": 55,
      "overall_evidence_score": 62,
      "notes": [
        "Analyzed 38 Google search results and 7 Hacker News stories",
        "Moderate competitor density (60): Some existing solutions detected",
        "Moderate pain signals (55): Some evidence of user needs",
        "Recent activity (72): Current discussions and interest in related topics"
      ]
    },
    "citations": [
      {
        "source": "google",
        "title": "Best Note-Taking Apps for Developers",
        "url": "https://example.com/apps"
      }
      // ... more citations
    ],
    "generatedAt": "2024-01-20T15:30:00.000Z"
  }
}
```

**Using Browser DevTools Console:**
```javascript
fetch('/api/evidence/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'your feature idea' })
})
  .then(r => r.json())
  .then(console.log)
```

---

### Method 3: Full End-to-End Test (Real User Flow)

**Steps:**

1. **Start Dev Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Intake Form**
   - Go to: `http://localhost:3000/new`

3. **Fill Out Form**
   - **Mode:** Choose "Early-stage founder" or "Existing startup"
   - **Feature Title:** e.g., "AI-powered code review assistant"
   - **Feature Description:** e.g., "An AI tool that automatically reviews pull requests and suggests improvements"
   - **ICP Role:** e.g., "Software Engineer"
   - **ICP Industry:** e.g., "Technology"
   - **Company Size:** e.g., "50-200"
   - **Goal Metric:** Choose one (e.g., "Activation")

4. **Click "Get Instant Verdict"**

5. **What Happens Behind the Scenes:**
   - Submission created in Firestore
   - Feature normalized via `/api/llm/normalize`
   - Evidence fetched via `/api/evidence/search`
   - Verdict generated via `/api/llm/verdict` (with evidence context)
   - Results stored in Firestore
   - Redirect to `/s/[id]` results page

6. **Expected Results Page:**
   - **Verdict Badge:** BUILD / RISKY / DON'T BUILD with confidence
   - **Reasons Section:** 3-6 detailed reasons
   - **Transparency Panel:** Should mention evidence findings
     - Look for phrases like: "We found X competitor-like results"
     - "HN shows Y stories with Z comments"
     - Evidence signals referenced in methodology

---

## What to Expect in Verdict Output

### With Evidence (Google CSE Configured)

**Transparency Section Example:**
```
Methodology:
- Analyzed external market signals including Google search results and Hacker News discussions
- Found 42 competitor-like products in this space (high competition)
- Hacker News shows 12 recent discussions with 340 total comments (strong community interest)
- Evidence score: 68/100 (moderate validation signals)
- Competitor density: 75/100 indicates saturated market
```

**Reasons May Include:**
- "High competition detected - 42 existing solutions found"
- "Strong community interest on Hacker News (12 discussions)"
- "Recent activity suggests ongoing demand"

### Without Evidence (No Google CSE)

**Transparency Section Example:**
```
Methodology:
- Analysis based on feature description and normalized problem statement
- External market signals (Google Trends, competitor analysis) were not available
- Confidence level reflects limited validation data
```

**Confidence Level:**
- Typically **MEDIUM** or **LOW** (unless problem is exceptionally clear)
- Verdict still generated but notes evidence limitations

---

## Troubleshooting

### CLI Script Fails

**Error: "Google CSE not configured"**
- **Solution:** This is expected if you don't have Google CSE keys
- The script should still fetch Hacker News data
- Add keys to `.env.local` if you want full evidence

**Error: "Cannot find module"**
- **Solution:** Run `npm install` to ensure dependencies are installed

### API Route Returns Errors

**Error: "INVALID_REQUEST"**
- **Check:** Request body must include `query` field
- **Fix:** Ensure JSON is properly formatted

**Error: "EVIDENCE_FETCH_FAILED"**
- **Check:** Both Google CSE and Hacker News failed
- **Likely Cause:** Network issue or Google CSE quota exceeded
- **Fix:** Check internet connection, verify Google CSE keys, check quota

### No Evidence in Verdict

**Symptom:** Verdict doesn't mention external evidence
- **Check:** Browser console for errors during evidence fetch
- **Check:** Network tab - is `/api/evidence/search` called?
- **Check:** Does it return 200 or error status?
- **Check:** Evidence stored in Firestore submission document

### Verdict Quality Issues

**Symptom:** Verdict seems generic or doesn't reference evidence
- **Check:** OpenAI API key is valid
- **Check:** Evidence was successfully fetched (check Firestore)
- **Check:** Verdict prompt includes evidence (check server logs)

---

## Verification Checklist

After testing, verify:

- [ ] CLI script runs and outputs signals + citations
- [ ] API route `/api/evidence/search` returns JSON with evidence
- [ ] Full submission flow works end-to-end
- [ ] Evidence is stored in Firestore submission document
- [ ] Verdict transparency section mentions evidence (if available)
- [ ] Citations are present in evidence object
- [ ] Signals are computed (competitor_density, pain_signal, recency_score)
- [ ] Graceful degradation when Google CSE is missing (Hacker News still works)

---

## Next Steps

Once testing is complete:

1. **Review Evidence Quality:**
   - Are keywords derived correctly?
   - Are Google searches relevant?
   - Are Hacker News results on-topic?

2. **Adjust Signal Computation:**
   - Edit `lib/evidence/signals.ts` to tune scoring heuristics
   - Modify weights in `computeOverallScore()` function

3. **Optimize Queries:**
   - Edit `lib/evidence/googleCse.ts` to change query patterns
   - Adjust number of queries in `generateSearchQueries()`

4. **Enhance Prompt:**
   - Edit `lib/llm/prompts.ts` to better incorporate evidence
   - Adjust how evidence is presented to LLM

---

## Sample Test Queries

Try these to see different signal patterns:

1. **High Competition:**
   - "Project management software"
   - "Email marketing platform"
   - "CRM system"

2. **Low Competition:**
   - "AI tool for auditing SQL queries"
   - "Developer productivity tracker for pair programming"
   - "Blockchain-based document verification"

3. **Strong Pain Signals:**
   - "How to manage remote team communication"
   - "Struggling with code review bottlenecks"
   - "Need better way to track feature requests"

4. **Recent Activity:**
   - "AI code generation tools"
   - "No-code automation platforms"
   - "Developer workflow optimization"

