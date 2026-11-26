import type { CreateRecipe, Recipe } from "../schema/recipe.schema.js";
import { prisma } from "../prisma.js";
import { NotFoundError, LowStockError } from "../errors/errors.js";
import { pageSize, toPantryItem } from "./pantryData.js";
import type { PantryItemWithIngredient } from "./pantryData.js";
import {
  Prisma,
  type Prisma as PrismaType,
} from "../generated/prisma/client.js";

export const findRecipeById = async (id: number): Promise<Recipe> => {
  const row = await prisma.recipe.findUnique({
    where: { id },
    include: {
      recipeIngredients: { include: { ingredient: true } },
      recipeSteps: true,
    },
  });
  if (row === null) {
    throw new NotFoundError(`Could not find the recipe with id ${id}`);
  } else {
    return toRecipe(row);
  }
};

export const findAllRecipes = async (
  page: number,
): Promise<{ items: Recipe[]; total: number }> => {
  const start = pageSize * (page - 1);
  const [recipeRows, total] = await Promise.all([
    prisma.recipe.findMany({
      include: {
        recipeIngredients: { include: { ingredient: true } },
        recipeSteps: true,
      },
      orderBy: { id: "asc" },
      skip: start,
      take: pageSize,
    }),
    prisma.pantryItem.count({}),
  ]);
  return {
    items: recipeRows.map(toRecipe),
    total,
  };
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

export const removeRecipe = async (id: number): Promise<void> => {
  try {
    await prisma.recipe.delete({
      where: { id },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw new NotFoundError("Recipe not found");
    }
    throw err;
  }
};
export type RecipeWithStepsAndIngredients = PrismaType.RecipeGetPayload<{
  include: {
    recipeIngredients: { include: { ingredient: true } };
    recipeSteps: true;
  };
}>;
export const toRecipe = (row: RecipeWithStepsAndIngredients): Recipe => ({
  id: row.id,
  name: row.name,
  cook_time_minutes: row.cook_time_minutes,
  prep_time_minutes: row.prep_time_minutes,
  recipeIngredients: row.recipeIngredients.map((ri) => ({
    quantity: ri.quantity.toNumber(),
    unit: ri.unit,
    ingredient: { name: ri.ingredient.name },
  })),
  recipeSteps: row.recipeSteps,
});

export const newRecipe = async (recipe: CreateRecipe): Promise<Recipe> => {
  const row = await prisma.recipe.create({
    data: {
      name: recipe.name,
      cook_time_minutes: recipe.cook_time_minutes,
      prep_time_minutes: recipe.prep_time_minutes,
      recipeSteps: {
        create: recipe.recipeSteps,
      },
      recipeIngredients: {
        create: recipe.recipeIngredients.map((ri) => ({
          quantity: ri.quantity,
          unit: ri.unit,
          ingredient: {
            connectOrCreate: {
              create: { name: ri.ingredient.name },
              where: { name: ri.ingredient.name },
            },
          },
        })),
      },
    },
    include: {
      recipeIngredients: { include: { ingredient: true } },
      recipeSteps: true,
    },
  });

  return toRecipe(row);
};
