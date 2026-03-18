-- KFG Pricing Website - Full Database Schema
-- Run this on a fresh database. For existing DBs use migration_001_item_fields.sql.

CREATE TABLE IF NOT EXISTS customers (
    id         VARCHAR(50)  PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
    id         SERIAL       PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_suppliers (
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    supplier_id INTEGER     NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    PRIMARY KEY (customer_id, supplier_id)
);

-- Auto-update timestamp helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS items (
    id                   VARCHAR(50)  PRIMARY KEY,
    name                 VARCHAR(255) NOT NULL,
    customer_id          VARCHAR(50)  NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    supplier_id          INTEGER      NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,

    -- Terms
    supplier_incoterms   VARCHAR(50),
    customer_incoterms   VARCHAR(50),

    -- Logistics
    logistics            NUMERIC(14, 4),
    container_type       VARCHAR(20),    -- select: see CONTAINER_TYPES in the frontend

    -- Incoterm prices
    fob                  NUMERIC(14, 4),
    cif                  NUMERIC(14, 4),
    dap                  NUMERIC(14, 4),
    ddp                  NUMERIC(14, 4),

    -- Volume / weight
    cases_in_fcl         INTEGER,
    units_in_case        INTEGER,
    unit_weight          NUMERIC(14, 4),

    -- Supplier pricing (some are auto-calculated in the UI from inputs above)
    supplier_price_unit  NUMERIC(14, 4),
    supplier_price_case  NUMERIC(14, 4),   -- supplier_price_unit × units_in_case
    supplier_price_fcl   NUMERIC(14, 4),   -- supplier_price_case × cases_in_fcl
    supplier_price_1kg   NUMERIC(14, 4),   -- supplier_price_unit / unit_weight

    -- Cost build-up (some auto-calculated)
    sub_total_1          NUMERIC(14, 4),   -- logistics + supplier_price_unit
    us_tariff            NUMERIC(14, 4),
    sub_total_2          NUMERIC(14, 4),   -- sub_total_1 + us_tariff
    import_factor        NUMERIC(14, 4),
    kfg_commission       NUMERIC(14, 4),
    total                NUMERIC(14, 4),   -- sub_total_2 + kfg_commission

    -- Final cost & price
    cost_unit            NUMERIC(14, 4),
    cost_case            NUMERIC(14, 4),
    price_unit           NUMERIC(14, 4),
    price_case           NUMERIC(14, 4),
    sap_price_unit       NUMERIC(14, 4),
    sap_price_case       NUMERIC(14, 4),

    created_at           TIMESTAMP    DEFAULT NOW(),
    updated_at           TIMESTAMP    DEFAULT NOW(),

    FOREIGN KEY (customer_id, supplier_id)
        REFERENCES customer_suppliers(customer_id, supplier_id)
);

DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_items_customer_supplier   ON items(customer_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_customer_suppliers_customer ON customer_suppliers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_suppliers_supplier ON customer_suppliers(supplier_id);
