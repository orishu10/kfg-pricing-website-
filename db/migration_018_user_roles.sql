ALTER TABLE users ADD COLUMN IF NOT EXISTS email       VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role        VARCHAR(20) NOT NULL DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB       NOT NULL DEFAULT '[]'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (lower(email)) WHERE email IS NOT NULL;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('admin', 'manager', 'user', 'customer'));

UPDATE users SET role = 'admin' WHERE role = 'user';
