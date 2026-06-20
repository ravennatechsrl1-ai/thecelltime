-- Per-locale promotion strip text (Italian + English)
ALTER TABLE promotion_strip
  ADD COLUMN IF NOT EXISTS text_it TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS text_en TEXT NOT NULL DEFAULT '';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'promotion_strip' AND column_name = 'text'
  ) THEN
    UPDATE promotion_strip
    SET
      text_it = COALESCE(NULLIF(text_it, ''), text, ''),
      text_en = COALESCE(NULLIF(text_en, ''), text, '')
    WHERE id = 1;

    ALTER TABLE promotion_strip DROP COLUMN text;
  END IF;
END $$;
