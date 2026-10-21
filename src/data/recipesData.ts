import type { Recipe } from "../generated/prisma/client.js";
import { prisma } from "../prisma.js";
import { NotFoundError, LowStockError } from "../errors/errors.js";
import { toPantryItem } from "./pantryData.js";
import type { PantryItemWithIngredient } from "./pantryData.js";

export const findRecipeById = async (id: number): Promise<Recipe> => {
  const row = await prisma.recipe.findUnique({
    where: { id },
  });
  if (row === null) {
    throw new NotFoundError(`Could not find the recipe with id ${id}`);
  } else {
    return row;
  }
};

export const cookRecipe = async (id: number, userId: number) => {
  return prisma.$transaction(async (tx) => {
    // 1. load the recipe WITH its ingredient lines, each line's ingredient,
    //    and that ingredient's pantry item (nested include). Missing recipe → NotFoundError
    const recipe = await tx.recipe.findUnique({
      where: { id },
      include: {
        recipeIngredients: {
          include: {
            ingredient: {
              include: { pantryItems: { where: { user_id: userId } } },
            },
          },
        },
      },
    });

    if (recipe == null) {
      throw new NotFoundError(`Could not find recipe with id ${id}`);
    }
    // 2. check every line: no pantry item / quantity 0 / unit mismatch / not enough → throw
    let updatedPantryItems: PantryItemWithIngredient[] = [];

    for (let ri of recipe.recipeIngredients) {
      const pantry = ri.ingredient.pantryItems[0] ?? null;
      if (pantry === null || pantry.quantity.isZero()) {
        throw new LowStockError(
          `Ingredient ${ri.ingredient.name} is not in the pantry`,
        );
      } else if (pantry.unit !== ri.unit) {
        throw new LowStockError(
          `Ingredient ${ri.ingredient.name} has mismatched unit: ${pantry.unit}, whereas ${ri.unit} is needed.`,
        );
      } else if (pantry.quantity.lt(ri.quantity)) {
        throw new LowStockError(
          `Ingredient ${ri.ingredient.name} has low quantity: ${pantry.quantity} ${pantry.unit}, whereas ${ri.quantity} ${ri.unit} is needed.`,
        );
      }
      // 3. update every pantry item: subtract, and set needs_restocking when it hits 0
      const newPantryQuantity = pantry.quantity.minus(ri.quantity);
      const newNeedsRestocking = newPantryQuantity.isZero()
        ? { needs_restocking: true }
        : {};
      const updatedPantryItem = await tx.pantryItem.update({
        where: { id: pantry.id },
        data: {
          quantity: newPantryQuantity,
          ...newNeedsRestocking,
        },
        include: { ingredient: true },
      });
      updatedPantryItems.push(updatedPantryItem);
    }
    // 4. return the updated pantry items (as PantryItem, via your toPantryItem)
    return updatedPantryItems.map(toPantryItem);
  });
};
