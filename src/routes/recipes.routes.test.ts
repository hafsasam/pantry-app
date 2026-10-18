import request from "supertest";
import { app } from "../app.js";
import { describe, beforeEach, test, expect, afterAll } from "vitest";
import { prisma } from "../prisma.js";
import { resetData } from "./utils.js";

const stockPantry = async (oatsG: number, milkMl: number) => {
  await prisma.pantryItem.create({
    data: {
      ingredient: {
        connectOrCreate: {
          where: { name: "rolled oats" },
          create: { name: "rolled oats" },
        },
      },
      quantity: oatsG,
      unit: "g",
      needs_restocking: false,
    },
  });
  await prisma.pantryItem.create({
    data: {
      ingredient: {
        connectOrCreate: {
          where: { name: "milk" },
          create: { name: "milk" },
        },
      },
      quantity: milkMl,
      unit: "ml",
      needs_restocking: false,
    },
  });
};

const createRecipe = async () => {
  return await prisma.recipe.create({
    data: {
      name: "Test oats",
      prep_time_minutes: 5,
      cook_time_minutes: 15,
      recipeIngredients: {
        create: [
          {
            quantity: 200,
            unit: "g",
            ingredient: {
              connectOrCreate: {
                where: { name: "rolled oats" },
                create: { name: "rolled oats" },
              },
            },
          },
          {
            quantity: 250,
            unit: "ml",
            ingredient: {
              connectOrCreate: {
                where: { name: "milk" },
                create: { name: "milk" },
              },
            },
          },
        ],
      },
    },
  });
};

describe("recipe endpoints", () => {
  let recipeId: number;

  beforeEach(async () => {
    await resetData();
    await stockPantry(600, 500);
    recipeId = (await createRecipe()).id;
  });

  test("successfully cook a recipe", async () => {
    const response = await request(app).post(`/recipes/${recipeId}/cook`);

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([
      {
        id: 1,
        name: "rolled oats",
        needs_restocking: false,
        quantity: 400,
        unit: "g",
      },
      {
        id: 2,
        name: "milk",
        needs_restocking: false,
        quantity: 250,
        unit: "ml",
      },
    ]);
    const pantry = await request(app).get("/pantry");
    expect(pantry.body).toEqual({
      data: [
        {
          id: 1,
          name: "rolled oats",
          needs_restocking: false,
          quantity: 400,
          unit: "g",
        },
        {
          id: 2,
          name: "milk",
          needs_restocking: false,
          quantity: 250,
          unit: "ml",
        },
      ],
      page: 1,
      pageSize: 10,
      totalItems: 2,
      totalPages: 1,
    });
  });

  test("recipe with low stock pantry items do not update any ingredient's quantity", async () => {
    await request(app).post(`/recipes/${recipeId}/cook`);
    const secondCook = await request(app).post(`/recipes/${recipeId}/cook`);
    const thirdCook = await request(app).post(`/recipes/${recipeId}/cook`);
    expect(secondCook.status).toEqual(200);
    expect(thirdCook.status).toEqual(409);
    expect(thirdCook.text).toContain("Ingredient milk is not in the pantry");
    const pantry = await request(app).get("/pantry");
    expect(pantry.body).toEqual({
      data: [
        {
          id: 1,
          name: "rolled oats",
          needs_restocking: false,
          quantity: 200,
          unit: "g",
        },
        {
          id: 2,
          name: "milk",
          needs_restocking: true,
          quantity: 0,
          unit: "ml",
        },
      ],
      page: 1,
      pageSize: 10,
      totalItems: 2,
      totalPages: 1,
    });
  });

  test("handle unknown ids", async () => {
    const response = await request(app).post("/recipes/999/cook");
    expect(response.status).toEqual(404);
    expect(response.text).toContain("Could not find recipe with id 999");
  });

  afterAll(() => prisma.$disconnect());
});
