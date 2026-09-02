
CREATE TABLE IF NOT EXISTS lookup_options (
    id         SERIAL       PRIMARY KEY,
    category   VARCHAR(50)  NOT NULL,
    value      VARCHAR(255) NOT NULL,
    sort_order INTEGER      NOT NULL DEFAULT 0,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lookup_category_value ON lookup_options(category, value);
CREATE INDEX IF NOT EXISTS idx_lookup_category ON lookup_options(category);

INSERT INTO lookup_options (category, value, sort_order)
SELECT 'incoterms', v.value, v.ord::int
FROM unnest(ARRAY['EXW', 'FCA', 'FOB', 'CIF', 'DAP', 'DDP']) WITH ORDINALITY AS v(value, ord)
ON CONFLICT (category, value) DO NOTHING;

INSERT INTO lookup_options (category, value, sort_order)
SELECT 'currency_pair', v.value, v.ord::int
FROM unnest(ARRAY['ILS > USD', 'ILS > EUR']) WITH ORDINALITY AS v(value, ord)
ON CONFLICT (category, value) DO NOTHING;

INSERT INTO lookup_options (category, value, sort_order)
SELECT 'country', v.value, v.ord::int
FROM unnest(ARRAY[
    'Israel', 'USA', 'Canada', 'UK', 'Germany', 'France', 'Italy',
    'Australia', 'Greece', 'Brazil'
]) WITH ORDINALITY AS v(value, ord)
ON CONFLICT (category, value) DO NOTHING;

INSERT INTO lookup_options (category, value, sort_order)
SELECT 'container', v.value, v.ord::int
FROM unnest(ARRAY['DRY40HC', 'DRY20HC', 'REF40HC']) WITH ORDINALITY AS v(value, ord)
ON CONFLICT (category, value) DO NOTHING;

INSERT INTO lookup_options (category, value, sort_order)
SELECT 'shipping_line', v.value, v.ord::int
FROM unnest(ARRAY[
    'MSC', 'ZIM', 'MAERSK', 'ONE', 'COSCO', 'HAPAG LLOYD', 'OOCL',
    'CMA CGM', 'EVERGREEN'
]) WITH ORDINALITY AS v(value, ord)
ON CONFLICT (category, value) DO NOTHING;

INSERT INTO lookup_options (category, value, sort_order)
SELECT 'sea_port', v.value, v.ord::int
FROM unnest(ARRAY[
    'Ashdod', 'Haifa', 'Ny', 'Newark', 'London Gateway', 'Felixtowe', 'Genoa',
    'Civitavecchia', 'Koper', 'Mersin', 'Istanbul', 'Izmir', 'Poti', 'Athens',
    'Marseille', 'Le Havre', 'Fos', 'Antwerp', 'Rotterdam', 'Hamburg', 'Gdynia',
    'Klaipeda', 'St Petersburg', 'Melbourne', 'Montreal', 'Toronto', 'Halifax',
    'Chicago', 'Los Angeles', 'Miami', 'Everglades'
]) WITH ORDINALITY AS v(value, ord)
ON CONFLICT (category, value) DO NOTHING;
