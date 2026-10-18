import { ValidationError } from "../errors/errors.js";
import { prisma } from "../prisma.js";

export const parseId = (id: unknown): number => {
  const numberId = Number(id);
  if (typeof id == "string" && Number.isInteger(numberId) && numberId > 0)
    return numberId;
  throw new ValidationError("Invalid id");
};

export const resetData = async () => {
  await prisma.$executeRaw`TRUNCATE pantry_items, ingredients, recipes, recipe_ingredients, recipe_steps RESTART IDENTITY CASCADE`;
};
