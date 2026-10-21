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
  const userId = req.session.userId!;
  const item = await cookRecipeId(parsedId, userId);
  res.json(item);
});
