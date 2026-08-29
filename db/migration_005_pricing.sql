-- Migration 005: PRICING module
-- A pricing record links a customer + an item and holds the full cost/price
-- build-up. Multiple (versioned) records per (customer, item) are allowed —
-- each row has its own auto-generated id (001, 002, …). Physical fields
-- (unit_weight, units_in_case, cases_in_fcl, pack_size) are snapshot-copied
-- from the item at save time so a version is self-contained.

CREATE SEQUENCE IF NOT EXISTS pricing_id_seq;

CREATE TABLE IF NOT EXISTS pricing (
    id                   VARCHAR(50)  PRIMARY KEY
                             DEFAULT lpad(nextval('pricing_id_seq')::text, 3, '0'),
    customer_id          VARCHAR(50)  NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    item_id              VARCHAR(50)  NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    kfg_sku              VARCHAR(100),
    status               VARCHAR(30)  DEFAULT 'Active',

    -- Description / currency
    currency             VARCHAR(20),
    pack_size            VARCHAR(100),   -- snapshot of item.size
    currency_pair        VARCHAR(30),    -- e.g. "ILS > US$"
    ex_rate              NUMERIC(14, 4),
    ex_current           NUMERIC(14, 4),

    -- Snapshot physical fields (read-only, from the item)
    unit_weight          NUMERIC(14, 4),
    units_in_case        INTEGER,
    cases_in_fcl         INTEGER,

    -- Log / route
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

CREATE INDEX IF NOT EXISTS idx_pricing_customer ON pricing(customer_id);
CREATE INDEX IF NOT EXISTS idx_pricing_item     ON pricing(item_id);
