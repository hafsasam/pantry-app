import type { PantryItem, PartialPantryItem } from "../schema/pantry.schema.js";
import { NotFoundError } from "../errors/errors.js";
import { pool } from "../db.js";
import type { QueryResult } from "pg";

export const pageSize: number = 10;

export const findAll = async (
  page: number,
  needs_restocking?: boolean,
): Promise<{ items: PantryItem[]; total: number }> => {
  const start = pageSize * (page - 1);
  const { rows: filteredPantryRows }: QueryResult<PantryItem> =
    await pool.query(
      "SELECT pi.id, i.name, pi.quantity::float8 AS quantity, pi.unit, pi.needs_restocking FROM pantry_items pi JOIN ingredients i ON pi.ingredient_id = i.id WHERE ($1::boolean IS NULL OR pi.needs_restocking = $1) ORDER BY pi.id ASC LIMIT $2 OFFSET $3",
      [needs_restocking ?? null, pageSize, start],
    );
  const { rows: totalPantryRows }: QueryResult<{ count: string }> =
    await pool.query(
      "SELECT count(*) FROM pantry_items pi JOIN ingredients i ON pi.ingredient_id = i.id WHERE ($1::boolean IS NULL OR pi.needs_restocking = $1)",
      [needs_restocking ?? null],
    );
  return {
    items: filteredPantryRows,
    total:
      totalPantryRows.length > 0 && totalPantryRows?.[0]
        ? +totalPantryRows[0].count
        : 0,
  };
};

export const create = async (
  item: Omit<PantryItem, "id">,
): Promise<PantryItem> => {
  const { rows: ingredients }: QueryResult<{ id: string }> = await pool.query(
    "INSERT INTO ingredients (name) SELECT $1 ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
    [item.name],
  );
  const { rows: pantryItem }: QueryResult<PantryItem> = await pool.query(
    "INSERT INTO pantry_items (quantity, unit, needs_restocking, ingredient_id) SELECT $1, $2, $3, $4 RETURNING quantity::float8 AS quantity, unit, needs_restocking, id",
    [item.quantity, item.unit, item.needs_restocking, ingredients[0]?.id],
  );
  const row = pantryItem[0];
  if (!row) {
    throw new Error("INSERT … RETURNING returned no row");
  }
  return { ...row, name: item.name };
};

export const findById = async (id: number): Promise<PantryItem> => {
  const { rows }: QueryResult<PantryItem> = await pool.query(
    "SELECT pi.id, i.name, pi.quantity::float8 AS quantity, pi.unit, pi.needs_restocking FROM pantry_items pi JOIN ingredients i ON pi.ingredient_id = i.id WHERE pi.id = $1",
    [id],
  );
  if (rows?.length > 0 && rows[0]) {
    return rows[0];
  }
  throw new NotFoundError(`Could not find the item with id ${id}`);
};

export const update = async (
  id: number,
  updatedItem: PartialPantryItem,
): Promise<PantryItem> => {
  const { rows }: QueryResult<PantryItem> = await pool.query(
    "UPDATE pantry_items pi SET quantity = COALESCE($1, quantity), unit = COALESCE($2, unit), needs_restocking = COALESCE($3, needs_restocking) FROM ingredients i WHERE i.id = pi.ingredient_id AND pi.id = $4 RETURNING pi.id, pi.quantity::float8 AS quantity, pi.unit, pi.needs_restocking, i.name",
    [updatedItem.quantity, updatedItem.unit, updatedItem.needs_restocking, id],
  );
  if (rows?.length > 0 && rows[0]) {
    return rows[0];
  } else {
    throw new NotFoundError(`Could not find the item to update with id ${id}`);
  }
};

export const remove = async (id: number): Promise<void> => {
  const { rowCount }: QueryResult<PantryItem> = await pool.query(
    "DELETE FROM pantry_items pi WHERE pi.id = $1",
    [id],
  );
  if (rowCount === 0) {
    throw new NotFoundError(`Could not find the item to remove with id ${id}`);
  }
};
