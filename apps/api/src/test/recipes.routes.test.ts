import { describe, beforeEach, test, expect, afterAll } from "vitest";
import { prisma } from "../prisma.js";
import { loginAs, promoteUser, resetData } from "./helpers.js";
import request from "supertest";
import { app } from "../app.js";
import { CookableRecipesSchema } from "@pantry/shared";

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

const createRecipe2 = async () => {
  return await prisma.recipe.create({
    data: {
      name: "Test chicken",
      prep_time_minutes: 25,
      cook_time_minutes: 40,
      recipeIngredients: {
        create: [
          {
            quantity: 150,
            unit: "g",
            ingredient: {
              connectOrCreate: {
                where: { name: "chicken breast" },
                create: { name: "chicken breast" },
              },
            },
          },
          {
            quantity: 500,
            unit: "g",
            ingredient: {
              connectOrCreate: {
                where: { name: "potatoes" },
                create: { name: "potatoes" },
              },
            },
          },
        ],
      },
    },
  });
};

const recipe = {
  name: "Grilled cheese",
  prep_time_minutes: 5,
  cook_time_minutes: 10,
  recipeIngredients: [
    {
      quantity: 100,
      unit: "g",
      ingredient: {
        name: "cheese",
      },
    },
    {
      quantity: 2,
      unit: "slice",
      ingredient: {
        name: "bread",
      },
    },
  ],
  recipeSteps: [
    { position: 1, text: "step 1" },
    { position: 2, text: "step 2" },
    { position: 3, text: "step 3" },
  ],
};

describe("recipe endpoints", () => {
  let recipeId: number;
  let agent: Awaited<ReturnType<typeof loginAs>>;

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

  test("non admin user can not create a recipe nor delete it", async () => {
    const bob = await loginAs("bob@me.com");
    const bobRecipeResponse = await bob.post("/recipes").send(recipe);
    expect(bobRecipeResponse.status).toEqual(403);

    await promoteUser("hafsa@me.com");

    const adminRecipeResponse = await agent.post("/recipes").send(recipe);
    expect(adminRecipeResponse.status).toEqual(201);

    const bobDeleteResp = await bob.delete(
      `/recipes/${adminRecipeResponse.body.id}`,
    );
    expect(bobDeleteResp.status).toEqual(403);
    expect(bobDeleteResp.body).toEqual({
      error: "You do not have access",
    });
    const allRecipes = await agent.get("/recipes");
    expect(allRecipes.status).toEqual(200);
    expect(allRecipes.body.totalItems).toEqual(2);
  });

  test("admin user can create a recipe", async () => {
    await promoteUser("hafsa@me.com");
    const adminRecipeResponse = await agent.post("/recipes").send(recipe);
    expect(adminRecipeResponse.status).toEqual(201);
    const allRecipes = await agent.get("/recipes");
    expect(allRecipes.status).toEqual(200);
    expect(
      allRecipes.body.data.some(
        (r: { name: string }) => r.name == "Grilled cheese",
      ),
    ).toBe(true);
  });

  test("admin user cannot cook a deleted recipe", async () => {
    await promoteUser("hafsa@me.com");

    const adminRecipeResponse = await agent.post("/recipes").send(recipe);
    expect(adminRecipeResponse.status).toEqual(201);

    const deleteRecipeResp = await agent.delete(
      `/recipes/${adminRecipeResponse.body.id}`,
    );
    expect(deleteRecipeResp.status).toEqual(204);

    const cookRecipeResp = await agent.post(
      `/recipes/${adminRecipeResponse.body.id}/cook`,
    );
    expect(cookRecipeResp.status).toEqual(404);
    expect(cookRecipeResp.body).toEqual({
      error: `Could not find recipe with id ${adminRecipeResponse.body.id}`,
    });
  });

  test("admin user cannot delete a non existing recipe", async () => {
    await promoteUser("hafsa@me.com");

    const deleteRecipeResp = await agent.delete(`/recipes/999999`);
    expect(deleteRecipeResp.status).toEqual(404);
    expect(deleteRecipeResp.body).toEqual({
      error: "Recipe not found",
    });
  });

  afterAll(() => prisma.$disconnect());
});

describe("GET /recipes/cookable", () => {
  let agent: Awaited<ReturnType<typeof loginAs>>;

  beforeEach(async () => {
    await resetData();
    await createRecipe();
  });

  test("unlogged user cannot get cookable recipes", async () => {
    const cookableRecipes = await request.agent(app).get(`/recipes/cookable`);
    expect(cookableRecipes.status).toEqual(401);
    expect(cookableRecipes.body).toEqual({
      error: "Login required",
    });
  });

  test("cookable recipes with empty pantry", async () => {
    agent = await loginAs("hafsa@me.com");
    const cookableRecipes = await agent.get(`/recipes/cookable`);
    expect(cookableRecipes.status).toEqual(200);
    expect(cookableRecipes.body.data).toHaveLength(1);
    expect(cookableRecipes.body.data[0].percent_available).toEqual(0);
    expect(cookableRecipes.body.data[0].missing).toEqual([
      "milk",
      "rolled oats",
    ]);
  });

  test("cookable recipes with oats only in pantry", async () => {
    agent = await loginAs("hafsa@me.com");
    await agent
      .post("/pantry")
      .send({ name: "rolled oats", quantity: 600, unit: "g" });
    const cookableRecipes = await agent.get(`/recipes/cookable`);
    expect(cookableRecipes.status).toEqual(200);
    expect(cookableRecipes.body.data).toHaveLength(1);
    expect(cookableRecipes.body.data[0].percent_available).toEqual(50);
    expect(cookableRecipes.body.data[0].missing).toEqual(["milk"]);
  });

  test("cookable recipes with no milk in pantry", async () => {
    agent = await loginAs("hafsa@me.com");
    await agent
      .post("/pantry")
      .send({ name: "rolled oats", quantity: 600, unit: "g" });
    await agent.post("/pantry").send({ name: "milk", quantity: 0, unit: "ml" });
    const cookableRecipes = await agent.get(`/recipes/cookable`);
    expect(cookableRecipes.status).toEqual(200);
    expect(cookableRecipes.body.data).toHaveLength(1);
    expect(cookableRecipes.body.data[0].percent_available).toEqual(50);
    expect(cookableRecipes.body.data[0].missing).toEqual(["milk"]);
  });

  test("cookable recipes with full pantry", async () => {
    agent = await loginAs("hafsa@me.com");
    await agent
      .post("/pantry")
      .send({ name: "rolled oats", quantity: 600, unit: "g" });
    await agent
      .post("/pantry")
      .send({ name: "milk", quantity: 500, unit: "ml" });
    const cookableRecipes = await agent.get(`/recipes/cookable`);
    expect(cookableRecipes.status).toEqual(200);
    expect(cookableRecipes.body.data).toHaveLength(1);
    expect(cookableRecipes.body.data[0].percent_available).toEqual(100);
    expect(cookableRecipes.body.data[0].missing).toEqual([]);
  });

  test("cookable recipes with full pantry but milk needs restocking", async () => {
    agent = await loginAs("hafsa@me.com");
    await agent
      .post("/pantry")
      .send({ name: "rolled oats", quantity: 600, unit: "g" });
    await agent.post("/pantry").send({
      name: "milk",
      quantity: 500,
      unit: "ml",
      needs_restocking: true,
    });
    const cookableRecipes = await agent.get(`/recipes/cookable`);
    expect(cookableRecipes.status).toEqual(200);
    expect(cookableRecipes.body.data).toHaveLength(1);
    expect(cookableRecipes.body.data[0].percent_available).toEqual(50);
    expect(cookableRecipes.body.data[0].missing).toEqual(["milk"]);
  });

  test("user B has milk, user A doesn't, and user A still sees milk as missing", async () => {
    agent = await loginAs("hafsa@me.com");
    await agent
      .post("/pantry")
      .send({ name: "rolled oats", quantity: 600, unit: "g" });
    await agent.post("/pantry").send({
      name: "milk",
      quantity: 500,
      unit: "ml",
    });
    const cookableRecipes = await agent.get(`/recipes/cookable`);
    expect(cookableRecipes.status).toEqual(200);
    expect(cookableRecipes.body.data).toHaveLength(1);
    expect(cookableRecipes.body.data[0].percent_available).toEqual(100);
    expect(cookableRecipes.body.data[0].missing).toEqual([]);

    await agent.post("/auth/logout");
    agent = await loginAs("bob@me.com");
    const cookableBobRecipes = await agent.get(`/recipes/cookable`);
    expect(cookableBobRecipes.status).toEqual(200);
    expect(cookableBobRecipes.body.data).toHaveLength(1);
    expect(cookableBobRecipes.body.data[0].percent_available).toEqual(0);
    expect(cookableBobRecipes.body.data[0].missing).toEqual([
      "milk",
      "rolled oats",
    ]);
  });

  test("two recipes are ordered DESC, the empty one comes last", async () => {
    agent = await loginAs("hafsa@me.com");

    await agent
      .post("/pantry")
      .send({ name: "rolled oats", quantity: 600, unit: "g" });
    await agent.post("/pantry").send({
      name: "milk",
      quantity: 500,
      unit: "ml",
    });

    await createRecipe2();
    await prisma.recipe.create({ data: { name: "Empty" } });

    const cookableRecipes = await agent.get(`/recipes/cookable`);
    expect(cookableRecipes.status).toEqual(200);
    expect(cookableRecipes.body.data).toHaveLength(3);
    expect(cookableRecipes.body.data[0].percent_available).toEqual(100);
    expect(cookableRecipes.body.data[0].missing).toEqual([]);
    expect(cookableRecipes.body.data[1].percent_available).toEqual(0);
    expect(cookableRecipes.body.data[1].missing).toEqual([
      "chicken breast",
      "potatoes",
    ]);
    expect(cookableRecipes.body.data[2].percent_available).toEqual(null);
    expect(cookableRecipes.body.data[2].missing).toEqual([]);

    expect(CookableRecipesSchema.parse(cookableRecipes.body)).toEqual({
      data: [
        {
          have_count: 2,
          missing: [],
          percent_available: 100,
          recipe_id: 1,
          recipe_name: "Test oats",
          total_ingredients: 2,
        },
        {
          have_count: 0,
          missing: ["chicken breast", "potatoes"],
          percent_available: 0,
          recipe_id: 2,
          recipe_name: "Test chicken",
          total_ingredients: 2,
        },
        {
          have_count: 0,
          missing: [],
          percent_available: null,
          recipe_id: 3,
          recipe_name: "Empty",
          total_ingredients: 0,
        },
      ],
    });
  });

  afterAll(() => prisma.$disconnect());
});
