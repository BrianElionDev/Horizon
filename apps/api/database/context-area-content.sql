-- ── Context Area Content (Phase 4) ───────────────────────
-- Replaces the context_areas JSONB blob on ideas.
-- One row per area per idea — fetch only what each page needs.

-- Drop old JSONB column (data loss is fine in dev)
alter table public.ideas drop column if exists context_areas;

-- New table: one row per context area per idea
create table if not exists public.context_area_content (
  id            uuid primary key default gen_random_uuid(),
  idea_id       uuid not null references public.ideas(id) on delete cascade,
  area_key      text not null,
  raw_content   text not null default '',
  sections      jsonb not null default '[]',
  structured_at timestamptz,
  completeness  integer not null default 0,
  updated_at    timestamptz not null default now(),
  unique (idea_id, area_key)
);

create index if not exists context_area_content_idea_idx on public.context_area_content(idea_id);

create or replace trigger context_area_content_updated_at
  before update on public.context_area_content
  for each row execute function public.handle_updated_at();

alter table public.context_area_content enable row level security;
