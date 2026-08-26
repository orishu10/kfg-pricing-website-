-- KFG Pricing Website - Full Database Schema
-- Run this on a fresh database. Existing DBs are migrated by the numbered
-- migration_*.sql files (see migration_004_dbm_standalone.sql for the DBM split).

-- Customers and suppliers are independent profile records (identical field set).
CREATE TABLE IF NOT EXISTS customers (
    id         VARCHAR(50)  PRIMARY KEY,   -- manually entered (e.g. 001)
    name       VARCHAR(255) NOT NULL,      -- full name
    short_name VARCHAR(255),
    phone      VARCHAR(50),
    incoterms  VARCHAR(50),
    address    VARCHAR(255),
    city       VARCHAR(255),
    zip_code   VARCHAR(50),
    country    VARCHAR(100),
    created_at TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
    id         VARCHAR(50)  PRIMARY KEY,   -- manually entered (e.g. 001)
    name       VARCHAR(255) NOT NULL,      -- full name
    short_name VARCHAR(255),
    phone      VARCHAR(50),
    incoterms  VARCHAR(50),
    address    VARCHAR(255),
    city       VARCHAR(255),
    zip_code   VARCHAR(50),
    country    VARCHAR(100),
    created_at TIMESTAMP    DEFAULT NOW()
);

-- Auto-update timestamp helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Items are a supplier-owned product catalog. IDs auto-generate (001, 002, …).
CREATE SEQUENCE IF NOT EXISTS items_id_seq;

CREATE TABLE IF NOT EXISTS items (
    id                   VARCHAR(50)  PRIMARY KEY
                             DEFAULT lpad(nextval('items_id_seq')::text, 3, '0'),
    name                 VARCHAR(255) NOT NULL,   -- description
    supplier_id          VARCHAR(50)  NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    size                 VARCHAR(100),

    -- Terms
    supplier_incoterms   VARCHAR(50),
    customer_incoterms   VARCHAR(50),

    -- Logistics
    logistics            NUMERIC(14, 4),
    container_type       VARCHAR(20),

    -- Incoterm prices
    fob                  NUMERIC(14, 4),
    cif                  NUMERIC(14, 4),
    dap                  NUMERIC(14, 4),
    ddp                  NUMERIC(14, 4),

    -- Volume / weight
    cases_in_fcl         INTEGER,
    units_in_case        INTEGER,
    unit_weight          NUMERIC(14, 4),
    cases_per_pallet     INTEGER,
    pallets_per_fcl      INTEGER,

    -- Supplier pricing (some auto-calculated in the UI)
    supplier_price_unit  NUMERIC(14, 4),
    supplier_price_case  NUMERIC(14, 4),
    supplier_price_fcl   NUMERIC(14, 4),
    supplier_price_1kg   NUMERIC(14, 4),

    -- Cost build-up (some auto-calculated)
    sub_total_1          NUMERIC(14, 4),
    us_tariff            NUMERIC(14, 4),
    sub_total_2          NUMERIC(14, 4),
    import_factor        NUMERIC(14, 4),
    kfg_commission       NUMERIC(14, 4),
    total                NUMERIC(14, 4),
    kfg_commission_total NUMERIC(14, 4),
    tariffs_total        NUMERIC(14, 4),
    usd_nis              NUMERIC(14, 4),

    -- Final cost & price
    cost_unit            NUMERIC(14, 4),
    cost_case            NUMERIC(14, 4),
    price_unit           NUMERIC(14, 4),
    price_case           NUMERIC(14, 4),
    sap_price_unit       NUMERIC(14, 4),
    sap_price_case       NUMERIC(14, 4),

    created_at           TIMESTAMP    DEFAULT NOW(),
    updated_at           TIMESTAMP    DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_items_supplier ON items(supplier_id);
