-- ── Context Areas (Phase 3) ───────────────────────────────
-- Stores raw content per context area as a JSONB blob on the idea.
-- Shape: { "<area_key>": { "rawContent": "...", "updatedAt": "ISO8601" } }
-- Empty areas are simply absent from the object — default is {}.

alter table public.ideas
  add column if not exists context_areas jsonb not null default '{}';

comment on column public.ideas.context_areas is
  'JSONB map of context area key → { rawContent, updatedAt }. Empty areas omitted.';
