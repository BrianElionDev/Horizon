-- ── Ideas ─────────────────────────────────────

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

create or replace trigger ideas_updated_at
  before update on public.ideas
  for each row execute function public.handle_updated_at();

alter table public.ideas enable row level security;



