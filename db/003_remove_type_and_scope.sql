-- ============================================================
-- Migration: Remove account type and category scope
-- ============================================================

ALTER TABLE accounts DROP COLUMN IF EXISTS type;
ALTER TABLE categories DROP COLUMN IF EXISTS applies_to;
