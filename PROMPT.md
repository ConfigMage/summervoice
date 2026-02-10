# PROMPT.md — Summer Voice AI Interviewer Build Spec

## What to Build

A conversational AI interviewer web app that replaces a traditional Likert-scale student survey for Oregon's summer learning programs. Students chat with an AI that adaptively interviews them about their summer program experience, covering all the themes from the original paper survey but in a natural conversation. After the interview, a separate AI analysis call extracts structured data (ratings, themes, summaries) from the transcript.

Read all supporting docs in `/docs` before building:
- `system-prompt-interviewer.md` — the AI interviewer's full system prompt
- `system-prompt-analyzer.md` — the post-interview analysis prompt
- `supabase-schema.sql` — database schema (run this in Supabase SQL editor)
- `survey-items.md` — all 50 survey items the analyzer rates

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Anthropic API (`claude-sonnet-4-5-20250929`)
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel

---

## Application Flow

### Screen 1: Welcome Page
Clean, warm welcome screen explaining what this is.

Content:
- "We want to hear about YOUR summer program experience!"
- This is a conversation (NOT a test, no wrong answers)
- Responses are private and anonymous
- Takes about 10-15 minutes
- Prominent "Let's Get Started" button

Design: Warm, inviting, slightly playful but not juvenile. Soft summer color palette (blues, greens, warm yellows). Large readable text. No Anthropic/Claude branding.

### Screen 2: Demographics Form
Collect before the conversation starts:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Program Name | Text input | No | "If you know it" |
| District Name | Text input | No | "Ask an adult if unsure" |
| School Name | Text input | No | "Ask an adult if unsure" |
| Grade (upcoming year) | Dropdown (5-12) | Yes | Drives tone adaptation |
| Race | Multi-select checkboxes | No | Options: American Indian/Alaskan Native, Native Hawaiian/Pacific Islander, Asian, Black/African American, White, Hispanic/Latino/a/x, Prefer not to answer |
| Home Language(s) | Text input | No | |
| Gender | Single-select radio | No | Female, Male, Non-binary, I prefer not to answer |

On submit: create `interviews` row in Supabase, transition to chat.

### Screen 3: Chat Interface
The core experience. A clean chat UI.

**UI Requirements:**
- Chat bubble style (assistant left, student right)
- Auto-scroll to latest message
- Text input with send button at bottom
- Typing indicator while AI responds
- "End Conversation" button (accessible but not prominent)
- Mobile responsive (school iPads, Chromebooks, phones)
- Clean, distraction-free
- No markdown rendering in chat bubbles — plain text only

**Behavior:**
- Stream AI responses for natural feel
- Save every message to Supabase `messages` table as it's sent/received
- Check each AI response for `[INTERVIEW_COMPLETE]` tag — strip from display, trigger completion flow
- If Anthropic API fails, show "Hmm, let me think..." and retry once

### Screen 4: Thank You Page
- Thank the student warmly
- Let them know their feedback matters
- Update interview status to `completed`
- Trigger post-interview analysis (async — student doesn't wait)

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/interview/create` | POST | Create interview with demographics, return interview_id |
| `/api/chat` | POST | Send message, get streamed AI response |
| `/api/interview/complete` | POST | Mark complete, trigger analysis |
| `/api/analyze` | POST | Run post-interview analysis (internal) |
| `/api/admin/auth` | POST | Validate admin password |
| `/api/admin/interviews` | GET | List all interviews (admin only) |
| `/api/admin/interview/[id]` | GET | Full interview detail (admin only) |
| `/api/admin/aggregate` | GET | Aggregate statistics (admin only) |
| `/api/admin/export` | GET | CSV export of ratings data (admin only) |

### Chat API Route Detail (`/api/chat`)
1. Receive `interview_id` and `message` (student's text)
2. Save student message to `messages` table
3. Load full conversation history from `messages` table
4. Load interview's grade level for tone adaptation
5. Call Anthropic API with interviewer system prompt (from `docs/system-prompt-interviewer.md`) + conversation history
6. Stream response back to frontend
7. Save complete AI response to `messages` table
8. Return response

### Analysis API Route Detail (`/api/analyze`)
1. Load full transcript from `messages` table
2. Load interview demographics
3. Call Anthropic API with analyzer system prompt (from `docs/system-prompt-analyzer.md`) + transcript
4. Parse JSON response
5. Insert into `summaries` table
6. Insert all ratings into `ratings` table
7. If `safety_flag` is true, update `interviews` row with flag + notes

### Streaming Implementation
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const stream = client.messages.stream({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 1024,
  system: getInterviewerSystemPrompt(grade),
  messages: conversationHistory,
});
```

---

## Admin Dashboard

### Route: `/admin`
Protected by simple password gate. Check against `ADMIN_PASSWORD` env var via `/api/admin/auth`. Store auth in cookie/session storage.

### Overview Panel
- Total interviews completed
- Interviews in progress
- Interviews with safety flags (highlighted red)
- Average completion time
- Breakdown by district/school

### Interview List
- Sortable, filterable table of all interviews
- Columns: Date, Program, District, School, Grade, Status, Safety Flag, Sentiment
- Click to expand: per-student summary, themes, key quotes, all ratings
- Filters: district, school, grade range, safety flag, date range

### Aggregate View
- Bar charts showing rating distribution per survey item across all students
- Split by direct vs. inferred ratings
- Filterable by district, school, grade
- Theme cloud: most common themes
- Most frequently mentioned strengths and improvements

### Safety Alerts Panel
- Dedicated section for ALL flagged interviews
- Sorted by recency, visually prominent
- Shows safety notes and relevant transcript excerpts
- This should NEVER get buried — make it a top-level tab or always-visible section

### Export
- CSV export of all ratings data for further analysis in Excel/Sheets

### Admin Design
- Clean, professional, data-dense
- Neutral palette (gray, white, blue) with red for safety flags
- Use Recharts for charts
- Tables should handle 100+ rows

---

## Component Structure

```
/components
  /welcome
    WelcomePage.tsx
  /demographics
    DemographicsForm.tsx
  /chat
    ChatInterface.tsx
    ChatBubble.tsx
    TypingIndicator.tsx
    ChatInput.tsx
  /thankyou
    ThankYouPage.tsx
  /admin
    AdminLogin.tsx
    AdminDashboard.tsx
    InterviewList.tsx
    InterviewDetail.tsx
    AggregateCharts.tsx
    SafetyAlerts.tsx
    ExportButton.tsx
  /ui
    Button.tsx
    Card.tsx
    Badge.tsx
```

---

## Vercel Config

```json
{
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 60
    },
    "app/api/analyze/route.ts": {
      "maxDuration": 120
    }
  }
}
```

---

## Design Direction

### Student-Facing (Welcome, Demographics, Chat, Thank You)
- Warm, inviting, slightly playful but not juvenile
- Summer palette: soft blues, greens, warm yellows
- Large, readable text (accessibility for younger students)
- Minimal chrome — conversation is the focus
- No Anthropic or Claude branding

### Admin Dashboard
- Clean, professional, data-dense
- Gray/white/blue with red accents for safety flags
- Information density over aesthetics

---

## Testing Scenarios
Build with these test cases in mind:
1. Simulated 5th grader (short answers, simple language)
2. Simulated 8th grader (moderate engagement)
3. Simulated 11th grader (detailed, opinionated)
4. Student who reports feeling unsafe (verify safety flag pipeline)
5. Disengaged student giving minimal answers (verify AI adapts)

---

## Scope Boundaries (POC)
- English only (Spanish is a fast follow)
- No FERPA compliance, no SSO, no RBAC
- Sessions not resumable
- Admin dashboard is read-only
- No real-time WebSocket updates on admin dashboard
