-- Tracks which route validity alert emails have already gone out, so the daily
-- notifier sends each stage once. The validity date is part of the key: pushing
-- a route's validity forward re-arms all three stages for the new date.
CREATE TABLE IF NOT EXISTS route_expiry_notifications (
    route_id VARCHAR(50)  NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    stage    VARCHAR(20)  NOT NULL CHECK (stage IN ('week', 'day', 'expired')),
    validity DATE         NOT NULL,
    sent_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (route_id, stage, validity)
);
