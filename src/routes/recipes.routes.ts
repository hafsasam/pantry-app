import express, { type Request, type Response } from "express";
import { parseId } from "./utils.js";
import { cookRecipeId } from "../services/services.js";

export const recipesRouter = express.Router({
  caseSensitive: true,
  strict: true,
});

recipesRouter.post("/:id/cook", async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsedId: number = parseId(id);
  const item = await cookRecipeId(parsedId);
  res.json(item);
});
