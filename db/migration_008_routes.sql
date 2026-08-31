CREATE SEQUENCE IF NOT EXISTS routes_id_seq;

CREATE TABLE IF NOT EXISTS routes (
    id                 VARCHAR(50)  PRIMARY KEY
                           DEFAULT lpad(nextval('routes_id_seq')::text, 3, '0'),
    reference          VARCHAR(100),
    agent              VARCHAR(255),
    shipping_line      VARCHAR(255),
    origin_port        VARCHAR(255),
    destination_port   VARCHAR(255),
    container_type     VARCHAR(50),
    tt                 VARCHAR(50),
    validity           DATE,

    usd_rate           NUMERIC(14, 4),
    eur_rate           NUMERIC(14, 4),

    fob_currency VARCHAR(10), fob_ils NUMERIC(14, 4), fob_usd NUMERIC(14, 4), fob_eur NUMERIC(14, 4),
    cif_currency VARCHAR(10), cif_ils NUMERIC(14, 4), cif_usd NUMERIC(14, 4), cif_eur NUMERIC(14, 4),
    dap_currency VARCHAR(10), dap_ils NUMERIC(14, 4), dap_usd NUMERIC(14, 4), dap_eur NUMERIC(14, 4),
    ddp_currency VARCHAR(10), ddp_ils NUMERIC(14, 4), ddp_usd NUMERIC(14, 4), ddp_eur NUMERIC(14, 4),

    created_by         VARCHAR(100),
    updated_by         VARCHAR(100),
    created_at         TIMESTAMP    DEFAULT NOW(),
    updated_at         TIMESTAMP    DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
CREATE TRIGGER update_routes_updated_at
    BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
