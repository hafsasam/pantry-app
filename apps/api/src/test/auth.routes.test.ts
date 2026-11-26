import { describe, beforeEach, test, expect, afterAll } from "vitest";
import { prisma } from "../prisma.js";
import { loginAs, resetData, mockItem } from "./helpers.js";
import request from "supertest";
import { app } from "../app.js";
import express from "express";
import { createLoginLimiter } from "../middleware/loginLimiter.js";

describe("auth endpoints", () => {
  beforeEach(async () => {
    await resetData();
  });

  test("POST /signup", async () => {
    const response = await request(app)
      .post(`/auth/signup`)
      .send({ email: "hafsa@me.com", password: "correct horse battery" });

    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(201);
    expect(response.body.id).toBe(1);
    expect(response.body.email).toBe("hafsa@me.com");
  });

  test("POST /login", async () => {
    await request(app)
      .post(`/auth/signup`)
      .send({ email: "hafsa@me.com", password: "correct horse battery" });

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "hafsa@me.com", password: "correct horse battery" });
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.id).toBe(1);
    expect(response.body.email).toBe("hafsa@me.com");
    expect(response.body.password_hash).toEqual(undefined);
  });

  test("POST /logout", async () => {
    const agent = await loginAs("hafsa@me.com");
    const response = await agent.post("/auth/logout");
    expect(response.status).toEqual(204);
    const response2 = await agent.get("/auth/me");
    expect(response2.status).toEqual(401);
  });

  test("GET /me", async () => {
    const agent = await loginAs("hafsa@me.com");
    const response = await agent.get("/auth/me");
    expect(response.status).toEqual(200);
    expect(response.body.id).toBe(1);
    expect(response.body.email).toBe("hafsa@me.com");
    expect(response.body.password_hash).toEqual(undefined);
  });

  test("cannot access a pantry without a session", async () => {
    const response = await request(app).get("/pantry");
    expect(response.status).toEqual(401);
  });

  test("wrong password/email have the same error message", async () => {
    await request(app)
      .post(`/auth/signup`)
      .send({ email: "hafsa@me.com", password: "correct horse battery" });
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "hafsa@me.com", password: "correct horse " });
    expect(response.status).toEqual(401);
    expect(response.body).toEqual({
      error: "Invalid credentials.",
    });
    const response2 = await request(app)
      .post("/auth/login")
      .send({ email: "hasa@me.com", password: "correct horse battery" });
    expect(response2.status).toEqual(401);
    expect(response2.body).toEqual({
      error: "Invalid credentials.",
    });
  });

  test("a user's added pantry item is unique to them", async () => {
    const alice = await loginAs("alice@me.com");
    const bob = await loginAs("bob@me.com");

    const resp = await alice.post("/pantry").send(mockItem);
    expect(resp.status).toEqual(201);
    const response = await bob.get("/pantry");
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.totalItems).toEqual(0);
  });

  test("a second user cannot tamper with another user's pantry items", async () => {
    const alice = await loginAs("alice@me.com");
    const bob = await loginAs("bob@me.com");

    const aliceResponse = await alice.post("/pantry").send(mockItem);
    expect(aliceResponse.status).toEqual(201);
    expect(aliceResponse.body.id).toEqual(1);
    const bobPatchResponse = await bob
      .patch(`/pantry/${aliceResponse.body.id}`)
      .send({
        quantity: 1.5,
      });
    expect(bobPatchResponse.status).toEqual(404);
    const bobDeleteResponse = await bob.delete(
      `/pantry/${aliceResponse.body.id}`,
    );
    expect(bobDeleteResponse.status).toEqual(404);
    const aliceGetResponse = await alice.get("/pantry");
    expect(aliceGetResponse.body.totalItems).toEqual(1);
    expect(aliceGetResponse.body.data[0].quantity).toEqual(2);
  });

  test("two different users can add the same item to their pantry", async () => {
    const alice = await loginAs("alice@me.com");
    const bob = await loginAs("bob@me.com");

    const response = await alice.post("/pantry").send(mockItem);
    expect(response.status).toEqual(201);
    const response2 = await bob.post("/pantry").send(mockItem);
    expect(response2.status).toEqual(201);
  });

  test("rate limiter set to 2 doesnt allow the third request to pass", async () => {
    const testApp = express();
    testApp.post("/login", createLoginLimiter(2), (req, res) => {
      res.sendStatus(200);
    });

    const r1 = await request(testApp).post("/login");
    const r2 = await request(testApp).post("/login");
    const r3 = await request(testApp).post("/login");

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(429);
    expect(r1.headers["ratelimit"]).toBeDefined(); // the draft-8 standard header
  });

  afterAll(() => prisma.$disconnect());
});
