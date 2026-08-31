CREATE SEQUENCE IF NOT EXISTS schedules_id_seq;

CREATE TABLE IF NOT EXISTS schedules (
    id           VARCHAR(50)  PRIMARY KEY
                     DEFAULT lpad(nextval('schedules_id_seq')::text, 3, '0'),
    vessel       VARCHAR(255),
    voyage       VARCHAR(100),
    pol          VARCHAR(255),
    pod          VARCHAR(255),
    etd          DATE,
    eta          DATE,
    tt           VARCHAR(50),
    ddl_con      VARCHAR(100),
    ddl_docs     VARCHAR(100),
    ddl_port     VARCHAR(100),

    created_by   VARCHAR(100),
    updated_by   VARCHAR(100),
    created_at   TIMESTAMP    DEFAULT NOW(),
    updated_at   TIMESTAMP    DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
