import request from "supertest";
import { app } from "../app.js";
import { describe, beforeEach, test, expect, afterAll } from "vitest";
import type { PantryItem } from "../schema/pantry.schema.js";
import { prisma } from "../prisma.js";

const mockItem: PantryItem = {
  id: 1,
  name: "milk",
  quantity: 2,
  unit: "l",
  needs_restocking: false,
};

const resetData = async () => {
  await prisma.$executeRaw`TRUNCATE pantry_items, ingredients, recipes, recipe_ingredients, recipe_steps RESTART IDENTITY CASCADE`;
};

describe("pantry items endpoints", () => {
  beforeEach(async () => {
    await resetData();
  });

  test("gets all pantry items and finds an emty array", async () => {
    const response = await request(app).get("/pantry");

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      data: [],
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    });
  });

  test("POST /pantry", async () => {
    const response = await request(app).post("/pantry").send(mockItem);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toEqual(mockItem);

    const response2 = await request(app).get("/pantry/1");
    expect(response2.status).toEqual(200);
    expect(response2.body).toEqual(mockItem);

    const response3 = await request(app).get("/pantry/abc");
    expect(response3.status).toEqual(400);
    expect(response3.body).toEqual({
      error: "Invalid id",
    });

    const response4 = await request(app).get("/pantry/999");
    expect(response4.status).toEqual(404);
    expect(response4.body).toEqual({
      error: "Could not find the item with id 999",
    });

    const response5 = await request(app).post("/pantry").send({});
    expect(response5.status).toEqual(400);
    expect(response5.body).toEqual({
      error: "Validation failed",
      details: expect.arrayContaining([
        expect.stringContaining("name:"),
        expect.stringContaining("quantity:"),
        expect.stringContaining("unit:"),
      ]),
    });
  });

  test("PATCH /pantry/:id", async () => {
    await request(app).post("/pantry").send(mockItem);

    const response = await request(app).patch("/pantry/1").send({
      quantity: 1.5,
    });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ ...mockItem, quantity: 1.5 });

    const response2 = await request(app).patch("/pantry/1").send({});
    expect(response2.status).toEqual(400);

    const response3 = await request(app).patch("/pantry/1").send({ id: 9 });
    expect(response3.status).toEqual(400);

    const response4 = await request(app)
      .patch("/pantry/999")
      .send({ needs_restocking: true });
    expect(response4.status).toEqual(404);
  });

  test("DELETE /pantry/:id", async () => {
    await request(app).post("/pantry").send(mockItem);

    const response = await request(app).delete("/pantry/1");
    expect(response.status).toEqual(204);

    const response2 = await request(app).get("/pantry");
    expect(response2.status).toEqual(200);
    expect(response2.body).toEqual({
      data: [],
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    });

    const response3 = await request(app).delete("/pantry/1");
    expect(response3.status).toEqual(404);
  });

  test("paginates items longers than 10", async () => {
    for (let i = 1; i <= 15; i++) {
      await request(app)
        .post("/pantry")
        .send({ ...mockItem, name: `item ${i}` });
    }

    const response = await request(app).get("/pantry");
    expect(response.status).toEqual(200);
    expect(response.body.totalItems).toEqual(15);
    expect(response.body.totalPages).toEqual(2);

    const response2 = await request(app).get("/pantry?page=1");
    expect(response2.status).toEqual(200);
    expect(response2.body.data).toHaveLength(10);

    const response3 = await request(app).get("/pantry?page=2");
    expect(response3.status).toEqual(200);
    expect(response3.body.data).toHaveLength(5);

    const response4 = await request(app).get("/pantry?page=0");
    expect(response4.status).toEqual(400);
  });

  test("handles needs_restocking query param", async () => {
    for (let i = 1; i <= 15; i++) {
      await request(app)
        .post("/pantry")
        .send({
          ...mockItem,
          name: `item ${i}`,
          needs_restocking: i % 3 === 0 ? true : false,
        });
    }

    const response = await request(app).get("/pantry?needs_restocking=true");
    expect(response.status).toEqual(200);
    expect(response.body.totalItems).toEqual(5);
    expect(response.body.totalPages).toEqual(1);

    const response2 = await request(app).get("/pantry?needs_restocking=false");
    expect(response2.status).toEqual(200);
    expect(response2.body.totalItems).toEqual(10);
    expect(response2.body.totalPages).toEqual(1);

    const response3 = await request(app).get(
      "/pantry?needs_restocking='false'",
    );
    expect(response3.status).toEqual(400);

    const response4 = await request(app).get("/pantry?needs_restocking=maybe");
    expect(response4.status).toEqual(400);
  });

  test("handles unknown routes", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toEqual(404);
  });

  test("handles invalid json in POST", async () => {
    const response = await request(app)
      .post("/pantry")
      .set("Content-Type", "application/json")
      .send("{quantity:-2}");
    expect(response.status).toEqual(400);
  });

  test("handles duplicate pantry items names in POST", async () => {
    await request(app).post("/pantry").send(mockItem);
    const response = await request(app).post("/pantry").send(mockItem);

    expect(response.status).toEqual(409);
  });

  test("no pantry item name in PATCH", async () => {
    await request(app).post("/pantry").send(mockItem);
    const response = await request(app)
      .patch("/pantry/1")
      .send({ name: "oats" });

    expect(response.status).toEqual(400);
  });

  afterAll(() => prisma.$disconnect());
});
