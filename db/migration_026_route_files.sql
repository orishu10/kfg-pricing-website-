CREATE TABLE IF NOT EXISTS route_files (
    route_id    VARCHAR(50)  PRIMARY KEY REFERENCES routes(id) ON DELETE CASCADE,
    filename    VARCHAR(255) NOT NULL,
    mime_type   VARCHAR(150) NOT NULL,
    size_bytes  INTEGER      NOT NULL,
    content     BYTEA        NOT NULL,
    uploaded_by VARCHAR(100),
    created_at  TIMESTAMP    DEFAULT NOW()
);
