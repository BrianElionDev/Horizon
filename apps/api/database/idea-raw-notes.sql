-- Add raw_notes to ideas — stores the cumulative raw dump from the setup page
alter table public.ideas
  add column if not exists raw_notes text;
