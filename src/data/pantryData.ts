import type { PantryItem, PartialPantryItem } from "../schema/pantry.schema.js";
import { NotFoundError } from "../errors/errors.js";

let pantry: PantryItem[] = [];

let nextId = pantry.length + 1;

export const pageSize: number = 10;

export const findAll = async (
  page: number,
  needs_restocking?: boolean,
): Promise<{ items: PantryItem[]; total: number }> => {
  const start = pageSize * (page - 1);
  const filteredPantry: PantryItem[] = pantry.filter((item) =>
    needs_restocking !== undefined
      ? item.needs_restocking == needs_restocking
      : item,
  );
  const items = [...filteredPantry.slice(start, start + pageSize)];
  return {
    items,
    total: filteredPantry.length,
  };
};

export const create = async (
  item: Omit<PantryItem, "id">,
): Promise<PantryItem> => {
  const newItem: PantryItem = { ...item, id: nextId };
  pantry.push(newItem);
  nextId++;

  return newItem;
};

export const findById = async (id: number): Promise<PantryItem> => {
  const item = pantry.find((item) => item.id === id);
  if (item) {
    return item;
  }
  throw new NotFoundError(`Could not find the item with id ${id}`);
};

export const update = async (
  id: number,
  updatedItem: PartialPantryItem,
): Promise<PantryItem> => {
  let indexToUpdate = pantry.findIndex((item) => item.id === id);
  if (indexToUpdate > -1 && pantry[indexToUpdate]) {
    pantry[indexToUpdate] = {
      ...pantry[indexToUpdate],
      ...updatedItem,
      id,
    };
    return pantry[indexToUpdate];
  } else {
    throw new NotFoundError(`Could not find the item to update with id ${id}`);
  }
};

export const remove = async (id: number): Promise<void> => {
  const indexToRemove = pantry.findIndex((item) => item.id === id);
  if (indexToRemove > -1) {
    pantry.splice(indexToRemove, 1);
  } else
    throw new NotFoundError(`Could not find the item to remove with id ${id}`);
};

export const resetData = () => {
  pantry = [];
  nextId = 1;
};
