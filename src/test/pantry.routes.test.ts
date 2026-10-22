import { describe, beforeEach, test, expect, afterAll } from "vitest";
import { prisma } from "../prisma.js";
import { loginAs, resetData, mockItem } from "./helpers.js";

describe("pantry items endpoints", () => {
  beforeEach(async () => {
    await resetData();
  });

  test("gets all pantry items and finds an emty array", async () => {
    const hafsa = await loginAs("hafsa@me.com");
    const response = await hafsa.get("/pantry");

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
    const hafsa = await loginAs("hafsa@me.com");
    const response = await hafsa.post("/pantry").send(mockItem);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body).toEqual(mockItem);

    const response2 = await hafsa.get("/pantry/1");
    expect(response2.status).toEqual(200);
    expect(response2.body).toEqual(mockItem);

    const response3 = await hafsa.get("/pantry/abc");
    expect(response3.status).toEqual(400);
    expect(response3.body).toEqual({
      error: "Invalid id",
    });

    const response4 = await hafsa.get("/pantry/999");
    expect(response4.status).toEqual(404);
    expect(response4.body).toEqual({
      error: "Could not find the item with id 999",
    });

    const response5 = await hafsa.post("/pantry").send({});
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
    const hafsa = await loginAs("hafsa@me.com");

    await hafsa.post("/pantry").send(mockItem);

    const response = await hafsa.patch("/pantry/1").send({
      quantity: 1.5,
    });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ ...mockItem, quantity: 1.5 });

    const response2 = await hafsa.patch("/pantry/1").send({});
    expect(response2.status).toEqual(400);

    const response3 = await hafsa.patch("/pantry/1").send({ id: 9 });
    expect(response3.status).toEqual(400);

    const response4 = await hafsa
      .patch("/pantry/999")
      .send({ needs_restocking: true });
    expect(response4.status).toEqual(404);
  });

  test("DELETE /pantry/:id", async () => {
    const hafsa = await loginAs("hafsa@me.com");
    await hafsa.post("/pantry").send(mockItem);

    const response = await hafsa.delete("/pantry/1");
    expect(response.status).toEqual(204);

    const response2 = await hafsa.get("/pantry");
    expect(response2.status).toEqual(200);
    expect(response2.body).toEqual({
      data: [],
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    });

    const response3 = await hafsa.delete("/pantry/1");
    expect(response3.status).toEqual(404);
  });

  test("paginates items longers than 10", async () => {
    const hafsa = await loginAs("hafsa@me.com");
    for (let i = 1; i <= 15; i++) {
      await hafsa.post("/pantry").send({ ...mockItem, name: `item ${i}` });
    }

    const response = await hafsa.get("/pantry");
    expect(response.status).toEqual(200);
    expect(response.body.totalItems).toEqual(15);
    expect(response.body.totalPages).toEqual(2);

    const response2 = await hafsa.get("/pantry?page=1");
    expect(response2.status).toEqual(200);
    expect(response2.body.data).toHaveLength(10);

    const response3 = await hafsa.get("/pantry?page=2");
    expect(response3.status).toEqual(200);
    expect(response3.body.data).toHaveLength(5);

    const response4 = await hafsa.get("/pantry?page=0");
    expect(response4.status).toEqual(400);
  });

  test("handles needs_restocking query param", async () => {
    const hafsa = await loginAs("hafsa@me.com");
    for (let i = 1; i <= 15; i++) {
      await hafsa.post("/pantry").send({
        ...mockItem,
        name: `item ${i}`,
        needs_restocking: i % 3 === 0 ? true : false,
      });
    }

    const response = await hafsa.get("/pantry?needs_restocking=true");
    expect(response.status).toEqual(200);
    expect(response.body.totalItems).toEqual(5);
    expect(response.body.totalPages).toEqual(1);

    const response2 = await hafsa.get("/pantry?needs_restocking=false");
    expect(response2.status).toEqual(200);
    expect(response2.body.totalItems).toEqual(10);
    expect(response2.body.totalPages).toEqual(1);

    const response3 = await hafsa.get("/pantry?needs_restocking='false'");
    expect(response3.status).toEqual(400);

    const response4 = await hafsa.get("/pantry?needs_restocking=maybe");
    expect(response4.status).toEqual(400);
  });

  test("handles unknown routes", async () => {
    const hafsa = await loginAs("hafsa@me.com");

    const response = await hafsa.get("/users");
    expect(response.status).toEqual(404);
  });

  test("handles invalid json in POST", async () => {
    const hafsa = await loginAs("hafsa@me.com");
    const response = await hafsa
      .post("/pantry")
      .set("Content-Type", "application/json")
      .send("{quantity:-2}");
    expect(response.status).toEqual(400);
  });

  test("handles duplicate pantry items names in POST", async () => {
    const hafsa = await loginAs("hafsa@me.com");

    await hafsa.post("/pantry").send(mockItem);
    const response = await hafsa.post("/pantry").send(mockItem);

    expect(response.status).toEqual(409);
  });

  test("no pantry item name in PATCH", async () => {
    const hafsa = await loginAs("hafsa@me.com");
    await hafsa.post("/pantry").send(mockItem);
    const response = await hafsa.patch("/pantry/1").send({ name: "oats" });

    expect(response.status).toEqual(400);
  });

  afterAll(() => prisma.$disconnect());
});
