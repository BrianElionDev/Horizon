-- ── Idea Analysis (Phase 4) ──────────────────────────────
-- Persists the last Forge analysis run for an idea.

alter table public.ideas
  add column if not exists last_analysis text,
  add column if not exists last_analysed_at timestamptz;
