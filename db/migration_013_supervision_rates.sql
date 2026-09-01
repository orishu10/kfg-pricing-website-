ALTER TABLE pricing ADD COLUMN IF NOT EXISTS supervision_cost_rate NUMERIC(14, 4);
ALTER TABLE pricing ADD COLUMN IF NOT EXISTS supervision_fees_rate NUMERIC(14, 4);
