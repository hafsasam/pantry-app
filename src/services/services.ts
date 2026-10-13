import {
  findAll,
  findById,
  create,
  update,
  remove,
  pageSize,
} from "../data/pantryData.js";
import {
  CreatePantrySchema,
  PartialPantrySchema,
  type PantryItem,
  type AllPantryItems,
} from "../schema/pantry.schema.js";

export const getAllItems = async (
  page: number,
  needs_restocking?: boolean,
): Promise<AllPantryItems> => {
  const { items: data, total: totalItems } = await findAll(
    page,
    needs_restocking,
  );
  const totalPages = Math.ceil(totalItems / pageSize);
  return { data, page, pageSize: pageSize, totalItems, totalPages };
};

export const getItemById = async (id: number): Promise<PantryItem> => {
  return findById(id);
};

export const createItem = async (body: unknown): Promise<PantryItem> => {
  const parsedBody = CreatePantrySchema.parse(body);
  return create(parsedBody);
};

export const updateItem = async (
  id: number,
  body: unknown,
): Promise<PantryItem> => {
  const parsedBody = PartialPantrySchema.parse(body);

  return update(id, parsedBody);
};

export const deleteItem = async (id: number): Promise<void> => {
  return remove(id);
};
