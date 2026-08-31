CREATE SEQUENCE IF NOT EXISTS weekly_shipments_id_seq;

CREATE TABLE IF NOT EXISTS weekly_shipments (
    id           VARCHAR(50)  PRIMARY KEY
                     DEFAULT lpad(nextval('weekly_shipments_id_seq')::text, 3, '0'),
    con          VARCHAR(50),
    customer     VARCHAR(255),
    supplier     VARCHAR(255),
    description  VARCHAR(255),
    pup          VARCHAR(255),
    pol          VARCHAR(255),
    pod          VARCHAR(255),
    vessel       VARCHAR(255),
    voyage       VARCHAR(100),
    etd          DATE,
    eta          DATE,
    booked       BOOLEAN      DEFAULT FALSE,

    created_by   VARCHAR(100),
    updated_by   VARCHAR(100),
    created_at   TIMESTAMP    DEFAULT NOW(),
    updated_at   TIMESTAMP    DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_weekly_shipments_updated_at ON weekly_shipments;
CREATE TRIGGER update_weekly_shipments_updated_at
    BEFORE UPDATE ON weekly_shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
