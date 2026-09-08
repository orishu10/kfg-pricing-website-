ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS currency VARCHAR(10);

INSERT INTO lookup_options (category, value, sort_order)
SELECT 'currency_pair', v.value, v.ord::int + 10
FROM unnest(ARRAY['USD > USD', 'EUR > EUR', 'ILS > ILS']) WITH ORDINALITY AS v(value, ord)
ON CONFLICT (category, value) DO NOTHING;
