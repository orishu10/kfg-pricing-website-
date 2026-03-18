-- Migration 001: Add all pricing fields to items
-- Run this against your kfg_pricing database in pgAdmin

-- Auto-update timestamp on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

ALTER TABLE items
    -- Metadata
    ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMP DEFAULT NOW(),

    -- Terms
    ADD COLUMN IF NOT EXISTS supplier_incoterms  VARCHAR(50),
    ADD COLUMN IF NOT EXISTS customer_incoterms  VARCHAR(50),

    -- Logistics
    ADD COLUMN IF NOT EXISTS logistics           NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS container_type      VARCHAR(20),

    -- Incoterm prices
    ADD COLUMN IF NOT EXISTS fob                 NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS cif                 NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS dap                 NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS ddp                 NUMERIC(14, 4),

    -- Volume / weight
    ADD COLUMN IF NOT EXISTS cases_in_fcl        INTEGER,
    ADD COLUMN IF NOT EXISTS units_in_case       INTEGER,
    ADD COLUMN IF NOT EXISTS unit_weight         NUMERIC(14, 4),

    -- Supplier pricing (some auto-calculated in the UI)
    ADD COLUMN IF NOT EXISTS supplier_price_unit NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS supplier_price_case NUMERIC(14, 4),  -- = supplier_price_unit × units_in_case
    ADD COLUMN IF NOT EXISTS supplier_price_fcl  NUMERIC(14, 4),  -- = supplier_price_case × cases_in_fcl
    ADD COLUMN IF NOT EXISTS supplier_price_1kg  NUMERIC(14, 4),  -- = supplier_price_unit / unit_weight

    -- Cost build-up (some auto-calculated in the UI)
    ADD COLUMN IF NOT EXISTS sub_total_1         NUMERIC(14, 4),  -- = logistics + supplier_price_unit
    ADD COLUMN IF NOT EXISTS sub_total_2         NUMERIC(14, 4),  -- = sub_total_1 + us_tariff
    ADD COLUMN IF NOT EXISTS import_factor       NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS kfg_commission      NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS us_tariff           NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS total               NUMERIC(14, 4),  -- = sub_total_2 + kfg_commission

    -- Final cost & price
    ADD COLUMN IF NOT EXISTS cost_unit           NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS cost_case           NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS price_unit          NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS price_case          NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS sap_price_unit      NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS sap_price_case      NUMERIC(14, 4);

-- Drop old generic column (replaced by the structured fields above)
ALTER TABLE items DROP COLUMN IF EXISTS final_price;

-- Attach the trigger
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
