-- App Settings table — run this in Supabase SQL Editor
-- Simple key-value store for runtime configuration (model selection, etc.)

create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Allow service role full access
alter table app_settings enable row level security;
create policy "service_all_app_settings" on app_settings for all using (true);

-- Seed defaults
insert into app_settings (key, value) values
  ('chat_model', 'claude-sonnet-4-5-20250929'),
  ('analysis_model', 'claude-sonnet-4-5-20250929')
on conflict (key) do nothing;
