import { prisma } from "../prisma.js";
import request from "supertest";
import { app } from "../app.js";
import { expect } from "vitest";
import type { PantryItem } from "../schema/pantry.schema.js";

export const resetData = async () => {
  await prisma.$executeRaw`TRUNCATE pantry_items, ingredients, recipes, recipe_ingredients, recipe_steps, users, session RESTART IDENTITY CASCADE`;
};

export const loginAs = async (
  email: string,
  password = "correct horse battery",
) => {
  const agent = request.agent(app);
  const response = await agent.post("/auth/signup").send({ email, password });
  expect(response.status).toBe(201);
  const response2 = await agent.post("/auth/login").send({ email, password });
  expect(response2.status).toBe(200);
  return agent;
};

export const promoteUser = async (email: string) => {
  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });
};

export const mockItem: PantryItem = {
  id: 1,
  name: "milk",
  quantity: 2,
  unit: "l",
  needs_restocking: false,
};
