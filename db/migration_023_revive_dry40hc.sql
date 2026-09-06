-- DRY40HC was soft-deleted from the Containers list, then re-adding it failed
-- because the (category, value) unique index still saw the inactive row.
-- Revive it (or recreate it if somehow gone) and restore it to the top of the list.
UPDATE lookup_options
SET sort_order = sort_order + 1
WHERE category = 'container' AND active = TRUE;

UPDATE lookup_options
SET active = TRUE, sort_order = 1
WHERE category = 'container' AND value = 'DRY40HC' AND active = FALSE;

INSERT INTO lookup_options (category, value, sort_order)
SELECT 'container', 'DRY40HC', 1
WHERE NOT EXISTS (
    SELECT 1 FROM lookup_options WHERE category = 'container' AND value = 'DRY40HC'
);
