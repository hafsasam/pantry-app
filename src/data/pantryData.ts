import type { PantryItem, PartialPantryItem } from "../schema/pantry.schema.js";
import { NotFoundError } from "../errors/errors.js";
import { prisma } from "../prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
export const pageSize: number = 10;

export type PantryItemWithIngredient = Prisma.PantryItemGetPayload<{
  include: { ingredient: true };
}>;

export const toPantryItem = (row: PantryItemWithIngredient): PantryItem => ({
  id: row.id,
  name: row.ingredient.name,
  unit: row.unit,
  quantity: row.quantity.toNumber(),
  needs_restocking: row.needs_restocking,
});

export const findAll = async (
  page: number,
  needs_restocking?: boolean,
): Promise<{ items: PantryItem[]; total: number }> => {
  const start = pageSize * (page - 1);
  const where = needs_restocking === undefined ? {} : { needs_restocking };
  const [filteredPantryRows, totalPantryRows] = await Promise.all([
    prisma.pantryItem.findMany({
      include: { ingredient: true },
      where,
      orderBy: { id: "asc" },
      skip: start,
      take: pageSize,
    }),
    prisma.pantryItem.count({
      where,
    }),
  ]);

  return {
    items: filteredPantryRows.map((i) => toPantryItem(i)),
    total: totalPantryRows,
  };
};

export const create = async (
  item: Omit<PantryItem, "id">,
): Promise<PantryItem> => {
  const pantryItem = await prisma.pantryItem.create({
    data: {
      ingredient: {
        connectOrCreate: {
          where: { name: item.name },
          create: {
            name: item.name,
          },
        },
      },
      quantity: item.quantity,
      unit: item.unit,
      needs_restocking: item.needs_restocking,
    },
    include: { ingredient: true },
  });

  return toPantryItem(pantryItem);
};

export const findById = async (id: number): Promise<PantryItem> => {
  const row = await prisma.pantryItem.findUnique({
    where: { id },
    include: { ingredient: true },
  });
  if (row === null) {
    throw new NotFoundError(`Could not find the item with id ${id}`);
  } else {
    return toPantryItem(row);
  }
};

export const update = async (
  id: number,
  updatedItem: PartialPantryItem,
): Promise<PantryItem> => {
  const row = await prisma.pantryItem.update({
    where: { id },
    include: { ingredient: true },
    data: {
      ...updatedItem,
    },
  });

  return toPantryItem(row);
};

export const remove = async (id: number): Promise<void> => {
  await prisma.pantryItem.delete({
    where: { id },
  });
};
