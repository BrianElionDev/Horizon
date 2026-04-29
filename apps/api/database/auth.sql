-- ── Auth ──────────────────────────────────────

create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  name          text,
  password_hash text not null,
  role          text not null default 'user',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  token      text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_token_idx   on public.sessions(token);
create index if not exists sessions_user_id_idx on public.sessions(user_id);

create or replace trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

alter table public.users    enable row level security;
alter table public.sessions enable row level security;



