CREATE SEQUENCE IF NOT EXISTS shipments_id_seq;

CREATE TABLE IF NOT EXISTS shipments (
    id                  VARCHAR(50)  PRIMARY KEY
                            DEFAULT lpad(nextval('shipments_id_seq')::text, 3, '0'),
    route               VARCHAR(50),
    status              VARCHAR(50),

    customer            VARCHAR(255),
    customer_incoterms  VARCHAR(100),
    description         VARCHAR(255),
    supplier_incoterms  VARCHAR(100),
    suppliers           JSONB        NOT NULL DEFAULT '[]'::jsonb,

    loading_place       VARCHAR(255),
    loading_date        DATE,
    trucking_company    VARCHAR(255),
    pup                 VARCHAR(255),
    pol                 VARCHAR(255),
    pod                 VARCHAR(255),

    container_type      VARCHAR(100),
    container_number    VARCHAR(100),
    shipping_line       VARCHAR(255),
    seal_number         VARCHAR(100),
    etd                 DATE,
    mbl_number          VARCHAR(100),
    eta                 DATE,
    temp_logger         VARCHAR(100),
    booking             VARCHAR(100),
    temperature         VARCHAR(50),
    tfc_reference       VARCHAR(100),
    export_release      VARCHAR(100),
    schedule_id         VARCHAR(50),

    purchase_orders     JSONB        NOT NULL DEFAULT '[]'::jsonb,
    invoices            JSONB        NOT NULL DEFAULT '[]'::jsonb,
    packing_lists       JSONB        NOT NULL DEFAULT '[]'::jsonb,
    isf                 VARCHAR(100),
    bl                  VARCHAR(100),
    export_entry        VARCHAR(100),
    trucking_invoice    VARCHAR(100),
    sea_freight_invoice VARCHAR(100),

    fob_charge          VARCHAR(100),
    cif_charge          VARCHAR(100),
    bl_manifest         BOOLEAN      DEFAULT FALSE,
    bl_credit           NUMERIC(14,4),
    additional_ees      NUMERIC(14,4),
    reserve             VARCHAR(100),
    drop_container      NUMERIC(14,4),
    warehouse_208       NUMERIC(14,4),
    trucking_charge     NUMERIC(14,4),
    extras              VARCHAR(255),

    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    created_at          TIMESTAMP    DEFAULT NOW(),
    updated_at          TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_etd ON shipments(etd);

DROP TRIGGER IF EXISTS update_shipments_updated_at ON shipments;
CREATE TRIGGER update_shipments_updated_at
    BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
