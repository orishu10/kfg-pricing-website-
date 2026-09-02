-- Total cost across all incoterm prices (FOB + CIF + DAP + DDP), expressed in a
-- user-picked currency. total_currency is the chosen currency; total_cost is the
-- derived sum stored as-is (mirrors how the per-incoterm values are stored).
ALTER TABLE routes ADD COLUMN IF NOT EXISTS total_currency VARCHAR(10);
ALTER TABLE routes ADD COLUMN IF NOT EXISTS total_cost NUMERIC(14, 4);
