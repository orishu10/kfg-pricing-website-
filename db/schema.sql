-- KFG Pricing Website - Database Schema

-- Customers: ID is provided manually by the user
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers: global, can serve multiple customers
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Junction table: which suppliers are linked to which customers
CREATE TABLE IF NOT EXISTS customer_suppliers (
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    PRIMARY KEY (customer_id, supplier_id)
);

-- Items: scoped to a specific customer+supplier relationship.
-- The same physical product sold to two customers = two separate rows
-- with different IDs and potentially different pricing.
-- ID is provided manually by the user.
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    final_price NUMERIC(12, 2),
    -- Pricing fields (extend here as needed)
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (customer_id, supplier_id) REFERENCES customer_suppliers(customer_id, supplier_id)
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_items_customer_supplier ON items(customer_id, supplier_id);
CREATE INDEX IF NOT EXISTS idx_customer_suppliers_customer ON customer_suppliers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_suppliers_supplier ON customer_suppliers(supplier_id);
