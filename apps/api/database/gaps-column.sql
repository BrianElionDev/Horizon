ALTER TABLE public.context_area_content
  ADD COLUMN IF NOT EXISTS gaps jsonb NOT NULL DEFAULT '[]';
