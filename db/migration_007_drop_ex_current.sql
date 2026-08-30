-- Ex Current is now a live, display-only market rate fetched from an FX API and
-- is never persisted. Drop the unused column. Defensive so it's safe to re-run.
ALTER TABLE pricing DROP COLUMN IF EXISTS ex_current;
