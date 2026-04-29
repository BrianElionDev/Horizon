-- ─────────────────────────────────────────────
-- Run this in Supabase SQL Editor to set up the database
-- ─────────────────────────────────────────────

-- Users
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  name        text,
  password_hash text not null,
  role        text not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Sessions (refresh token store)
create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  token       text unique not null,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists sessions_token_idx   on public.sessions(token);
create index if not exists sessions_user_id_idx on public.sessions(user_id);

-- Ideas
do $$ begin
  if not exists (select 1 from pg_type where typname = 'idea_status') then
    create type idea_status as enum (
      'NEW', 'EXPLORING', 'VALIDATED', 'ARCHIVED', 'DISMISSED'
    );
  end if;
end $$;


create table if not exists public.ideas (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  status      idea_status not null default 'NEW',
  origin      text,
  user_id     uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists ideas_user_status_idx     on public.ideas(user_id, status);
create index if not exists ideas_user_created_at_idx on public.ideas(user_id, created_at desc);

-- Auto-update updated_at on row changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create or replace trigger ideas_updated_at
  before update on public.ideas
  for each row execute function public.handle_updated_at();

-- Enable RLS (Security Best Practice)
-- The backend uses the service role key which bypasses RLS,
-- so no additional policies are required. This ensures the 
-- database is private by default.
alter table public.users   enable row level security;
alter table public.sessions enable row level security;
alter table public.ideas   enable row level security;



