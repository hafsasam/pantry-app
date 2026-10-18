CREATE INDEX pantry_items_needs_restocking_partial_idx
ON pantry_items (id) WHERE needs_restocking;
