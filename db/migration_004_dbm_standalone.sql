-- Migration 004: DBM standalone model
-- Decouple customers, suppliers and items. Customers and suppliers become
-- independent profile records (identical field set). Items belong to a supplier
-- only (no customer). Supplier IDs become manual strings; item IDs auto-generate.
-- Written defensively so it is a no-op on a DB already in the new shape.

-- 1. Drop every foreign key on items (the composite junction FK + single-col FKs)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'items'::regclass AND contype = 'f'
  LOOP
    EXECUTE 'ALTER TABLE items DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- 2. Remove the customer link from items and drop the junction table
ALTER TABLE items DROP COLUMN IF EXISTS customer_id;
DROP TABLE IF EXISTS customer_suppliers;

-- 3. Profile columns on customers and suppliers (identical field set)
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS short_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone      VARCHAR(50),
  ADD COLUMN IF NOT EXISTS incoterms  VARCHAR(50),
  ADD COLUMN IF NOT EXISTS address    VARCHAR(255),
  ADD COLUMN IF NOT EXISTS city       VARCHAR(255),
  ADD COLUMN IF NOT EXISTS zip_code   VARCHAR(50),
  ADD COLUMN IF NOT EXISTS country    VARCHAR(100);

ALTER TABLE suppliers
  ADD COLUMN IF NOT EXISTS short_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone      VARCHAR(50),
  ADD COLUMN IF NOT EXISTS incoterms  VARCHAR(50),
  ADD COLUMN IF NOT EXISTS address    VARCHAR(255),
  ADD COLUMN IF NOT EXISTS city       VARCHAR(255),
  ADD COLUMN IF NOT EXISTS zip_code   VARCHAR(50),
  ADD COLUMN IF NOT EXISTS country    VARCHAR(100);

-- 4. Supplier manual (string) IDs; align items.supplier_id type to match
ALTER TABLE suppliers ALTER COLUMN id DROP DEFAULT;          -- detach SERIAL default
ALTER TABLE suppliers ALTER COLUMN id TYPE VARCHAR(50) USING id::text;
DROP SEQUENCE IF EXISTS suppliers_id_seq;                    -- old SERIAL sequence, now unused
ALTER TABLE items ALTER COLUMN supplier_id TYPE VARCHAR(50) USING supplier_id::text;

-- re-add the simple supplier FK (guard against re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'items'::regclass AND conname = 'items_supplier_id_fkey'
  ) THEN
    ALTER TABLE items
      ADD CONSTRAINT items_supplier_id_fkey
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Item catalog field + auto-generated zero-padded IDs (001, 002, …)
ALTER TABLE items ADD COLUMN IF NOT EXISTS size VARCHAR(100);
CREATE SEQUENCE IF NOT EXISTS items_id_seq;
ALTER TABLE items ALTER COLUMN id SET DEFAULT lpad(nextval('items_id_seq')::text, 3, '0');

-- Keep the customer/supplier lookup indexes tidy (junction indexes are gone with the table)
CREATE INDEX IF NOT EXISTS idx_items_supplier ON items(supplier_id);
