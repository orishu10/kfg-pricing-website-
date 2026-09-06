-- Containers (and other lookup categories) can carry a pallet capacity that
-- feeds the Pricing form's "Pallets" field.
ALTER TABLE lookup_options ADD COLUMN IF NOT EXISTS pallets INTEGER;
