-- KFG Pricing Website — full database schema (single source of truth).
-- Every table is defined here in its final shape; run this on a fresh database.
-- Defensive DDL (IF NOT EXISTS / CREATE OR REPLACE) keeps it safe to re-run.

-- Customers and suppliers are independent profile records (identical field set).
CREATE TABLE IF NOT EXISTS customers (
    id         VARCHAR(50)  PRIMARY KEY,   -- manually entered (e.g. 001)
    name       VARCHAR(255) NOT NULL,      -- full name
    short_name VARCHAR(255),
    phone      VARCHAR(50),
    incoterms  VARCHAR(50),
    currency   VARCHAR(10),                -- USD / EUR / ILS (drives pricing)
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

-- Application login accounts (bcrypt password hashes).
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL       PRIMARY KEY,
    username      VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Auto-update timestamp helper (used by the items and pricing triggers).
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

CREATE INDEX IF NOT EXISTS idx_items_supplier ON items(supplier_id);

-- Pricing links a customer + an item and holds the full cost/price build-up.
-- Multiple (versioned) records per (customer, item) are allowed — each row has
-- its own auto-generated id (001, 002, …). The physical fields (pack_size,
-- unit_weight, units_in_case, cases_in_fcl) are snapshot-copied from the item at
-- save time so a version stays self-contained. Value columns are stored as-is
-- (the UI computes them) to allow manual overrides, mirroring items.
CREATE SEQUENCE IF NOT EXISTS pricing_id_seq;

CREATE TABLE IF NOT EXISTS pricing (
    -- Identity & links
    id                   VARCHAR(50)  PRIMARY KEY
                             DEFAULT lpad(nextval('pricing_id_seq')::text, 3, '0'),
    customer_id          VARCHAR(50)  NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    item_id              VARCHAR(50)  NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    kfg_sku              VARCHAR(100),
    status               VARCHAR(30)  DEFAULT 'Active',

    -- Snapshot from the item (read-only)
    pack_size            VARCHAR(100),   -- item.size at save time
    unit_weight          NUMERIC(14, 4),
    units_in_case        INTEGER,
    cases_in_fcl         INTEGER,

    -- Currency / exchange (ex_current is a live, display-only rate — not stored)
    currency             VARCHAR(20),
    currency_pair        VARCHAR(30),    -- e.g. "ILS > USD"
    ex_rate              NUMERIC(14, 4),

    -- Logistics / route
    cases_per_pallet     INTEGER,
    pallets_per_fcl      INTEGER,
    pallets              INTEGER,
    route                VARCHAR(100),
    container_type       VARCHAR(20),
    incoterms_supplier   VARCHAR(50),

    -- Incoterm prices
    fob                  NUMERIC(14, 4),
    cif                  NUMERIC(14, 4),
    dap                  NUMERIC(14, 4),
    ddp                  NUMERIC(14, 4),

    -- Supplier pricing
    supplier_price_unit  NUMERIC(14, 4),
    supplier_price_case  NUMERIC(14, 4),
    supplier_price_fcl   NUMERIC(14, 4),
    supplier_price_1kg   NUMERIC(14, 4),
    price_unit_ils       NUMERIC(14, 4),
    price_unit_usd       NUMERIC(14, 4),
    price_case_ils       NUMERIC(14, 4),
    price_case_usd       NUMERIC(14, 4),
    price_fcl_usd        NUMERIC(14, 4),

    -- Cost build-up
    sub_total_1          NUMERIC(14, 4),
    sub_total_2          NUMERIC(14, 4),
    us_tariff            NUMERIC(14, 4),
    us_tariff_pct        NUMERIC(14, 4),
    import_factor        NUMERIC(14, 4),
    kfg_commission       NUMERIC(14, 4),
    kfg_commission_pct   NUMERIC(14, 4),
    kfg_commission_total NUMERIC(14, 4),
    tariffs_total        NUMERIC(14, 4),
    total                NUMERIC(14, 4),
    usd_nis              NUMERIC(14, 4),
    supervision_cost     NUMERIC(14, 4),
    supervision_fees     NUMERIC(14, 4),

    -- Final cost & price
    cost_unit            NUMERIC(14, 4),
    cost_case            NUMERIC(14, 4),
    cost_1kg             NUMERIC(14, 4),
    price_unit           NUMERIC(14, 4),
    price_case           NUMERIC(14, 4),
    price_1kg            NUMERIC(14, 4),
    sap_price_unit       NUMERIC(14, 4),
    sap_price_case       NUMERIC(14, 4),
    sap_price_1kg        NUMERIC(14, 4),

    -- Attribution
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100),
    created_at           TIMESTAMP    DEFAULT NOW(),
    updated_at           TIMESTAMP    DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_pricing_updated_at ON pricing;
CREATE TRIGGER update_pricing_updated_at
    BEFORE UPDATE ON pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- The composite serves the "versions for this customer × item" lookup (and
-- customer-side cascade deletes); the item index covers item-side lookups.
CREATE INDEX IF NOT EXISTS idx_pricing_customer_item ON pricing(customer_id, item_id);
CREATE INDEX IF NOT EXISTS idx_pricing_item          ON pricing(item_id);
