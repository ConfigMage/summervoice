-- Summer Voice AI Interviewer — Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database.

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-----------------------------------------------------------
-- INTERVIEWS: one row per student session
-----------------------------------------------------------
create table interviews (
  id uuid primary key default uuid_generate_v4(),

  -- Demographics (collected via form before chat)
  program_name text,
  district_name text,
  school_name text,
  grade integer not null check (grade between 5 and 12),
  race text[],                          -- array of selected options
  home_languages text,
  gender text,

  -- Status tracking
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'abandoned')),

  -- Safety flag (set by post-interview analysis)
  safety_flag boolean not null default false,
  safety_notes text,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-----------------------------------------------------------
-- MESSAGES: full chat transcript
-----------------------------------------------------------
create table messages (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid not null references interviews(id) on delete cascade,
  role text not null check (role in ('assistant', 'user')),
  content text not null,
  created_at timestamptz not null default now()
);

-----------------------------------------------------------
-- RATINGS: survey item ratings (direct + inferred)
-----------------------------------------------------------
create table ratings (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid not null references interviews(id) on delete cascade,
  survey_item text not null,
  survey_category text not null,
  value text not null check (value in (
    'strongly_agree', 'agree', 'disagree', 'strongly_disagree',
    'yes', 'no',
    'often', 'sometimes', 'rarely', 'never',
    'always', 'a_lot',
    'not_discussed'
  )),
  source text not null check (source in ('direct', 'inferred')),
  confidence float,                     -- 0.0-1.0, only meaningful for inferred
  created_at timestamptz not null default now(),

  unique(interview_id, survey_item)
);

-----------------------------------------------------------
-- SUMMARIES: per-student analysis (generated post-interview)
-----------------------------------------------------------
create table summaries (
  id uuid primary key default uuid_generate_v4(),
  interview_id uuid not null references interviews(id) on delete cascade,
  summary text not null,
  themes text[] not null default '{}',
  key_quotes text[] not null default '{}',
  sentiment_overview jsonb,             -- { overall, safety, belonging, ... }
  strengths text[],
  improvements text[],
  created_at timestamptz not null default now()
);

-----------------------------------------------------------
-- INDEXES
-----------------------------------------------------------
create index idx_interviews_status on interviews(status);
create index idx_interviews_district on interviews(district_name);
create index idx_interviews_school on interviews(school_name);
create index idx_interviews_safety on interviews(safety_flag) where safety_flag = true;
create index idx_messages_interview on messages(interview_id, created_at);
create index idx_ratings_interview on ratings(interview_id);
create index idx_ratings_category on ratings(survey_category);
create index idx_summaries_interview on summaries(interview_id);

-----------------------------------------------------------
-- UPDATED_AT TRIGGER
-----------------------------------------------------------
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger interviews_updated_at
  before update on interviews
  for each row execute function update_updated_at();

-----------------------------------------------------------
-- ROW LEVEL SECURITY
-----------------------------------------------------------
alter table interviews enable row level security;
alter table messages enable row level security;
alter table ratings enable row level security;
alter table summaries enable row level security;

-- POC: Allow anonymous inserts for student-facing operations
create policy "anon_insert_interviews" on interviews for insert with check (true);
create policy "anon_insert_messages" on messages for insert with check (true);

-- POC: Allow anonymous select on interviews and messages (needed for chat flow)
create policy "anon_select_interviews" on interviews for select using (true);
create policy "anon_select_messages" on messages for select using (true);

-- Service role gets full access (used by API routes with SUPABASE_SERVICE_ROLE_KEY)
create policy "service_all_interviews" on interviews for all using (true);
create policy "service_all_messages" on messages for all using (true);
create policy "service_all_ratings" on ratings for all using (true);
create policy "service_all_summaries" on summaries for all using (true);
