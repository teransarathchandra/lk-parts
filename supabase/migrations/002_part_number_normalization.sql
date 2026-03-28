-- Migration 002: Part number normalization
-- Normalized generated columns for fuzzy part number matching.
-- e.g., "15400-PLM-A02" and "15400PLM-A02" both match.

ALTER TABLE products
  ADD COLUMN normalized_oem_part_number TEXT
    GENERATED ALWAYS AS (
      regexp_replace(lower(oem_part_number), '[^a-z0-9]', '', 'g')
    ) STORED;

ALTER TABLE products
  ADD COLUMN normalized_aftermarket_part_number TEXT
    GENERATED ALWAYS AS (
      regexp_replace(lower(aftermarket_part_number), '[^a-z0-9]', '', 'g')
    ) STORED;

CREATE INDEX idx_products_oem_normalized ON products(normalized_oem_part_number);
CREATE INDEX idx_products_aftermarket_normalized ON products(normalized_aftermarket_part_number);
