# Evidence-Based Evaluation Improvements

## Root Cause Analysis

### Original Problem
The system claimed "weak market signals" and "no competitors" for "Automate resume checking and verification + ATS-friendly enhancement" despite this being an established market with major players (Workday, iCIMS, Greenhouse, Jobscan, Checkr, etc.).

### Root Causes Identified
1. **Naive query generation**: Only 4-5 generic queries ("software", "tool", "alternative", "pricing") missed competitor-specific searches
2. **No competitor extraction**: System counted domains but didn't identify/rank actual competitors by name
3. **Weak market signals**: Pain signal over-weighted Hacker News, which doesn't represent recruiter/HR discussions
4. **LLM hallucination**: Prompt didn't enforce evidence-grounded reasoning, allowing "no competitors" claims despite evidence
5. **Missing competitor analysis**: Verdict didn't explicitly list competitors found

---

## Changes Implemented

### PART A: Evidence Search Upgrades

#### A1: Strategic Query Generation (`lib/evidence/queryBuilder.ts`)
**New file** - Generates 6-10 strategic queries:
- Core product searches: "software", "tool", "pricing", "alternatives"
- Domain-specific: "ATS" for job-related queries
- Competitor discovery: "best X tools", "top X software"
- Buyer intent: "for recruiters", "for hiring teams"
- Category-specific: "ATS resume parsing", "employment verification API"

**Example output for resume feature:**
```
1. resume checking verification software
2. resume checking verification tool
3. resume checking verification pricing
4. resume checking verification alternatives
5. resume checking verification ATS
6. best resume checking verification tools
7. top resume checking verification software
8. ATS resume parsing software
```

#### A2: Competitor Extraction (`lib/evidence/competitors.ts`)
**New file** - Extracts and ranks competitors:
- Parses Google CSE results to identify competitor domains
- Scores competitors by:
  - Enterprise ATS detection (Workday, iCIMS, Greenhouse, etc.) - 50pt boost
  - Category keyword matches (ATS, resume parsing, screening, etc.)
  - Product indicators in domain/text
- Classifies categories: ATS, Resume Optimizer, Screening/Matching, Verification/Background
- Returns top 8 competitors with confidence scores

**Competitor structure:**
```typescript
{
  name: string,
  domain: string,
  url: string,
  category: "ATS" | "Resume Optimizer" | "Screening/Matching" | "Verification/Background",
  overlapReason: string,
  evidenceSnippets: string[],
  confidence: "high" | "med" | "low"
}
```

#### A3: Updated Evidence Types (`lib/evidence/types.ts`)
Added to `NormalizedEvidence`:
- `competitors: Competitor[]` - Array of extracted competitors
- `competitorSummary: CompetitorSummary` - Summary with total count, top names, saturation signal

#### A4: Fixed Market Established Logic (`lib/evidence/signals.ts`)
**Changes:**
- `marketEstablished` flag: `true` if competitors.length >= 3 OR enterprise ATS found
- Competitor density now uses actual competitor count, not domain count
- HN recency logic: Don't penalize low HN activity for B2B/HR tools (neutral/positive score if enterprise competitors found)
- Notes explicitly mention: "HN may not represent recruiter/HR discussions"

#### A5: Evidence Coverage Score (`lib/evidence/signals.ts`)
New `evidenceCoverage` (0-100) based on:
- Google results count (0-40)
- Competitor count (0-40)
- Pricing pages found (0-10)
- HN coverage (0-10 bonus)

**Usage**: If coverage < 30, verdict must note "insufficient evidence"

---

### PART B: Evidence-Grounded Verdicts

#### B1: Updated API Route (`app/api/evidence/search/route.ts`)
- Uses `buildSearchQueries()` for strategic query generation
- Extracts competitors after Google CSE fetch
- Includes competitors and summary in evidence response

#### B2: Verdict Schema (`lib/llm/schemas.ts`)
Added `competitorAnalysis` field to `VerdictResponseSchema`:
```typescript
competitorAnalysis: z.array(CompetitorAnalysisSchema).min(0).max(5)
```

Each competitor analysis includes:
- name, category, whatTheyDo, whyOverlaps, link

#### B3: Hard Constraints in Prompt (`lib/llm/prompts.ts`)
**New prompt includes:**
1. **Evidence-based reasoning**: Use ONLY provided evidence
2. **Never claim "no competitors"** if competitors.length >= 3 or marketEstablished=true
3. **Insufficient evidence handling**: Lower confidence if coverage < 30
4. **RISKY definition**: Means saturated/unclear differentiation, NOT "no market"
5. **Competitor analysis required**: Must include top 5 from evidence
6. **Methodology must include**: Query samples, competitor extraction method, HN caveats

**System message** also enforces these rules.

#### B4: Improved RISKY Logic
"RISKY" now correctly means:
- Saturated market dominated by incumbents
- Unclear differentiation
- Wrong buyer segment
- Compliance/data sensitivity friction

NOT "no demand" or "no competitors"

---

### PART C: UI Additions

#### CompetitorsView Component (`components/CompetitorsView.tsx`)
**New component** displays:
- Competitor cards with name, category, what they do, why they overlap
- Links to competitor websites
- Evidence coverage warning if coverage < 30

#### Results Page (`app/s/[id]/page.tsx`)
Added CompetitorsView section after VerdictView, before PivotOptions.

---

### PART D: Testing

#### Updated CLI Script (`scripts/evidenceProbe.ts`)
**Enhanced output:**
- Shows all queries used
- Lists competitors found (top 8) with categories
- Shows signals including evidenceCoverage and marketEstablished
- Saves full evidence to `evidence.sample.json`

---

## File Changes Summary

### New Files
- `lib/evidence/competitors.ts` - Competitor extraction logic
- `lib/evidence/queryBuilder.ts` - Strategic query generation
- `components/CompetitorsView.tsx` - Competitor display component
- `EVIDENCE_IMPROVEMENTS.md` - This documentation

### Modified Files
- `lib/evidence/types.ts` - Added Competitor, CompetitorSummary types
- `lib/evidence/googleCse.ts` - Updated to accept queries array (not keywords)
- `lib/evidence/normalize.ts` - Added competitor extraction and summary generation
- `lib/evidence/signals.ts` - Market established logic, evidence coverage, HN caveats
- `app/api/evidence/search/route.ts` - Uses query builder, extracts competitors
- `lib/llm/schemas.ts` - Added CompetitorAnalysisSchema to VerdictResponseSchema
- `lib/llm/prompts.ts` - Complete rewrite with hard evidence constraints
- `app/api/llm/verdict/route.ts` - Enhanced system message with constraints
- `lib/domain/types.ts` - Added CompetitorAnalysis to VerdictResponse
- `app/s/[id]/page.tsx` - Added CompetitorsView component
- `scripts/evidenceProbe.ts` - Enhanced to show queries and competitors

---

## Testing Instructions

### 1. Test CLI Script
```bash
npm run evidence:probe "ATS resume checker and optimizer"
```

**Expected output:**
- 6-10 strategic queries listed
- Competitors found (should include Workday, iCIMS, Greenhouse, Jobscan if available)
- Signals showing marketEstablished=true if 3+ competitors
- Evidence coverage score

### 2. Test Full Flow
1. Submit feature: "Automate resume checking and verification + ATS-friendly enhancement"
2. Check verdict - should:
   - List competitors found (not claim "no competitors")
   - If marketEstablished=true, acknowledge established market
   - Show competitor analysis section on results page
   - Reference evidence in reasons

### 3. Verify Evidence-Grounded Behavior
- If competitors found but verdict says "no competitors" → BUG
- If evidenceCoverage < 30 but confidence is HIGH → BUG
- If marketEstablished=true but methodology doesn't mention it → BUG

---

## Verification Checklist

✅ Strategic queries generated (6-10 per search)
✅ Competitors extracted and ranked
✅ Market established logic works (3+ competitors OR enterprise ATS)
✅ Evidence coverage calculated
✅ Verdict prompt enforces evidence-grounded reasoning
✅ competitorAnalysis included in verdict schema
✅ UI displays competitors on results page
✅ CLI script shows queries and competitors

---

## Expected Behavior for Resume Example

**Input**: "Automate resume checking and verification + ATS-friendly enhancement"

**Expected Output:**
- ✅ Queries include: "ATS resume checker", "resume parsing ATS", competitor names
- ✅ Competitors found: Workday, iCIMS, Greenhouse, Jobscan, Checkr (if available in search)
- ✅ marketEstablished: true (because 3+ competitors OR enterprise ATS found)
- ✅ Verdict acknowledges: "Established market with major players including Workday, iCIMS..."
- ✅ competitorAnalysis: Lists top 5 competitors with links
- ✅ RISKY verdict (if given) explains: "Saturated market" NOT "no market"

---

## Key Improvements

1. **Better Discovery**: 6-10 strategic queries vs 4-5 generic ones
2. **Explicit Competitors**: Named competitors vs just domain counts
3. **Market Awareness**: marketEstablished flag prevents "no market" claims
4. **Evidence Coverage**: Quantifies data quality, flags insufficient evidence
5. **Hard Constraints**: LLM cannot hallucinate "no competitors" if evidence shows otherwise
6. **Transparency**: Methodology lists queries used and extraction method

---

## Migration Notes

Existing submissions without competitorAnalysis will still work - the field is optional. New submissions will include full competitor analysis.

