import {
  findAll,
  findById,
  create,
  update,
  remove,
  pageSize,
} from "../data/pantryData.js";
import {
  cookRecipe,
  findAllRecipes,
  newRecipe,
  removeRecipe,
} from "../data/recipesData.js";
import {
  CreatePantrySchema,
  PartialPantrySchema,
  type PantryItem,
  type AllPantryItems,
} from "../schema/pantry.schema.js";
import {
  CreateRecipeSchema,
  RecipeSchema,
  type AllRecipesSchema,
  type Recipe,
} from "../schema/recipe.schema.js";

export const getAllItems = async (
  page: number,
  userId: number,
  needs_restocking?: boolean,
): Promise<AllPantryItems> => {
  const { items: data, total: totalItems } = await findAll(
    page,
    userId,
    needs_restocking,
  );
  const totalPages = Math.ceil(totalItems / pageSize);
  return { data, page, pageSize: pageSize, totalItems, totalPages };
};

export const getItemById = async (
  id: number,
  userId: number,
): Promise<PantryItem> => {
  return findById(id, userId);
};

export const createItem = async (
  body: unknown,
  userId: number,
): Promise<PantryItem> => {
  const parsedBody = CreatePantrySchema.parse(body);
  return create(parsedBody, userId);
};

export const updateItem = async (
  id: number,
  body: unknown,
  userId: number,
): Promise<PantryItem> => {
  const parsedBody = PartialPantrySchema.parse(body);

  return update(id, parsedBody, userId);
};

export const deleteItem = async (id: number, userId: number): Promise<void> => {
  return remove(id, userId);
};

export const cookRecipeId = async (
  id: number,
  userId: number,
): Promise<PantryItem[]> => {
  return cookRecipe(id, userId);
};

export const deleteRecipe = async (id: number): Promise<void> => {
  return removeRecipe(id);
};

export const getAllRecipes = async (
  page: number,
): Promise<AllRecipesSchema> => {
  const { items: data, total: totalItems } = await findAllRecipes(page);
  const totalPages = Math.ceil(totalItems / pageSize);
  return { data, page, pageSize: pageSize, totalItems, totalPages };
};

export const createRecipe = async (body: unknown): Promise<Recipe> => {
  const parsedBody = CreateRecipeSchema.parse(body);
  return newRecipe(parsedBody);
};
