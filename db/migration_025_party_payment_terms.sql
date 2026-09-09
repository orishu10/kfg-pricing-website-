ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100);
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(100);

INSERT INTO lookup_options (category, value, sort_order)
SELECT 'payment_terms', v.value, v.ord::int
FROM unnest(ARRAY[
    'Prepaid', 'CAD', 'LC', 'Net 30', 'Net 45', 'Net 60', 'Net 90',
    'EOM + 30', 'EOM + 60'
]) WITH ORDINALITY AS v(value, ord)
ON CONFLICT (category, value) DO NOTHING;
