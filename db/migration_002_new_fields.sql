-- Migration 002: Add kfg_commission_total, tariffs_total, usd_nis, cases_per_pallet, pallets_per_fcl

ALTER TABLE items
    ADD COLUMN IF NOT EXISTS kfg_commission_total  NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS tariffs_total         NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS usd_nis               NUMERIC(14, 4),
    ADD COLUMN IF NOT EXISTS cases_per_pallet      INTEGER,
    ADD COLUMN IF NOT EXISTS pallets_per_fcl       INTEGER;
