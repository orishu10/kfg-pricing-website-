-- The richer LOG shipment record lives on weekly_shipments; the standalone
-- shipments table from migration_019 is superseded and never carried data.
DROP TABLE IF EXISTS shipments;
DROP SEQUENCE IF EXISTS shipments_id_seq;

ALTER TABLE weekly_shipments
    ADD COLUMN IF NOT EXISTS route               VARCHAR(50),
    ADD COLUMN IF NOT EXISTS status              VARCHAR(50),
    ADD COLUMN IF NOT EXISTS format_id           INTEGER,
    ADD COLUMN IF NOT EXISTS customer_incoterms  VARCHAR(100),
    ADD COLUMN IF NOT EXISTS supplier_incoterms  VARCHAR(100),
    ADD COLUMN IF NOT EXISTS suppliers           JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS loading_place       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS loading_date        DATE,
    ADD COLUMN IF NOT EXISTS trucking_company    VARCHAR(255),
    ADD COLUMN IF NOT EXISTS container_number    VARCHAR(100),
    ADD COLUMN IF NOT EXISTS shipping_line       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS seal_number         VARCHAR(100),
    ADD COLUMN IF NOT EXISTS mbl_number          VARCHAR(100),
    ADD COLUMN IF NOT EXISTS temp_logger         VARCHAR(100),
    ADD COLUMN IF NOT EXISTS booking             VARCHAR(100),
    ADD COLUMN IF NOT EXISTS temperature         VARCHAR(50),
    ADD COLUMN IF NOT EXISTS tfc_reference       VARCHAR(100),
    ADD COLUMN IF NOT EXISTS export_release      VARCHAR(100),
    ADD COLUMN IF NOT EXISTS schedule_id         VARCHAR(50),
    ADD COLUMN IF NOT EXISTS purchase_orders     JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS invoices            JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS packing_lists       JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS isf                 VARCHAR(100),
    ADD COLUMN IF NOT EXISTS bl                  VARCHAR(100),
    ADD COLUMN IF NOT EXISTS export_entry        VARCHAR(100),
    ADD COLUMN IF NOT EXISTS trucking_invoice    VARCHAR(100),
    ADD COLUMN IF NOT EXISTS sea_freight_invoice VARCHAR(100),
    ADD COLUMN IF NOT EXISTS fob_charge          VARCHAR(100),
    ADD COLUMN IF NOT EXISTS cif_charge          VARCHAR(100),
    ADD COLUMN IF NOT EXISTS bl_manifest         BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS bl_credit           NUMERIC(14,4),
    ADD COLUMN IF NOT EXISTS additional_ees      NUMERIC(14,4),
    ADD COLUMN IF NOT EXISTS reserve             VARCHAR(100),
    ADD COLUMN IF NOT EXISTS drop_container      NUMERIC(14,4),
    ADD COLUMN IF NOT EXISTS warehouse_208       NUMERIC(14,4),
    ADD COLUMN IF NOT EXISTS trucking_charge     NUMERIC(14,4),
    ADD COLUMN IF NOT EXISTS extras              VARCHAR(255);

-- Existing rows carry a single supplier; seed the multi-supplier list from it
-- so the Suppliers column keeps rendering after the switch.
UPDATE weekly_shipments
SET suppliers = to_jsonb(ARRAY[supplier])
WHERE supplier IS NOT NULL AND supplier <> '' AND suppliers = '[]'::jsonb;

-- Admin-authored field templates: `fields` holds the picked shipment field keys.
CREATE TABLE IF NOT EXISTS shipment_formats (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    fields      JSONB        NOT NULL DEFAULT '[]'::jsonb,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100),
    created_at  TIMESTAMP    DEFAULT NOW(),
    updated_at  TIMESTAMP    DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shipment_formats_name ON shipment_formats(lower(name));

DROP TRIGGER IF EXISTS update_shipment_formats_updated_at ON shipment_formats;
CREATE TRIGGER update_shipment_formats_updated_at
    BEFORE UPDATE ON shipment_formats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
