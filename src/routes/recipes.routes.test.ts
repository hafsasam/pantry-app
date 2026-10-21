import { describe, beforeEach, test, expect, afterAll } from "vitest";
import { prisma } from "../prisma.js";
import { loginAs, resetData } from "./utils.js";

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
  let agent: Awaited<ReturnType<typeof loginAs>>; // the type of what loginAs returns

  beforeEach(async () => {
    await resetData();
    agent = await loginAs("hafsa@me.com");
    await agent
      .post("/pantry")
      .send({ name: "rolled oats", quantity: 600, unit: "g" });
    await agent
      .post("/pantry")
      .send({ name: "milk", quantity: 500, unit: "ml" });
    recipeId = (await createRecipe()).id;
  });

  test("successfully cook a recipe", async () => {
    const response = await agent.post(`/recipes/${recipeId}/cook`);

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
    const pantry = await agent.get("/pantry");
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
    await agent.post(`/recipes/${recipeId}/cook`);
    const secondCook = await agent.post(`/recipes/${recipeId}/cook`);
    const thirdCook = await agent.post(`/recipes/${recipeId}/cook`);
    expect(secondCook.status).toEqual(200);
    expect(thirdCook.status).toEqual(409);
    expect(thirdCook.text).toContain("Ingredient milk is not in the pantry");
    const pantry = await agent.get("/pantry");
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
    const response = await agent.post("/recipes/999/cook");
    expect(response.status).toEqual(404);
    expect(response.text).toContain("Could not find recipe with id 999");
  });

  afterAll(() => prisma.$disconnect());
});
