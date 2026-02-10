# Summer Voice AI Interviewer

## Project Context
Conversational AI survey tool for Oregon's summer learning programs (grades 5-12). Replaces traditional Likert-scale student surveys with adaptive AI-powered interviews, inspired by Anthropic's "Anthropic Interviewer" tool. This is a proof of concept for the Oregon Department of Education.

## Tech Stack
- Next.js 14+ (App Router), TypeScript, Tailwind CSS
- Anthropic API (claude-sonnet-4-20250514) for interviewer + post-interview analysis
- Supabase (PostgreSQL) for database
- Deploy target: Vercel

## Key Architecture Decisions
- Demographics collected via traditional form BEFORE chat starts
- 10 anchor survey items asked directly during conversation (with Likert rating)
- Remaining ~40 items inferred from transcript via post-interview analysis API call
- Grade level (5-12) drives conversational tone adaptation
- Strong negative/positive responses trigger deeper follow-up probing
- Safety concerns flagged prominently in summaries and admin dashboard
- `[INTERVIEW_COMPLETE]` tag signals frontend to end the chat session
- All rating extraction (direct + inferred) handled by the post-interview analyzer
- Streaming responses for natural chat feel

## Environment Variables Required
- ANTHROPIC_API_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_PASSWORD

## Database Tables
- `interviews` — one row per student session (demographics, status, safety flags)
- `messages` — full chat transcript (interview_id, role, content)
- `ratings` — survey item ratings, both direct and inferred (with confidence scores)
- `summaries` — per-student analysis (summary, themes, quotes, sentiment)

## Key Files
- `PROMPT.md` — full project spec and build instructions
- `docs/system-prompt-interviewer.md` — AI interviewer system prompt
- `docs/system-prompt-analyzer.md` — post-interview analysis system prompt
- `docs/supabase-schema.sql` — database schema
- `docs/survey-items.md` — complete list of all 50 survey items for rating extraction

## Application Flow
1. Welcome screen → 2. Demographics form → 3. Chat interface → 4. Thank you screen
Admin dashboard at /admin (password protected)

## Commands
- `npm run dev` — local development
- `npm run build` — production build
- `npx supabase db push` — push schema to Supabase

## Scope Boundaries (POC)
- English only (Spanish is a fast follow)
- No FERPA compliance audit, no SSO, no RBAC
- Sessions not resumable (transcript saved but student starts over if tab closes)
- Admin dashboard is read-only
