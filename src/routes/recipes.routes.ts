import express, { type Request, type Response } from "express";
import { parseId } from "./utils.js";
import {
  cookRecipeId,
  createRecipe,
  deleteRecipe,
  getAllRecipes,
} from "../services/services.js";
import { requireRole } from "../middleware/requireRole.js";
import { RecipeQuerySchema } from "../schema/recipe.schema.js";

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

recipesRouter.delete(
  "/:id",
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const parsedId: number = parseId(id);
    await deleteRecipe(parsedId);
    res.sendStatus(204);
  },
);

recipesRouter.get("/", async (req: Request, res: Response) => {
  const { page } = RecipeQuerySchema.parse(req.query);
  const recipes = await getAllRecipes(page);
  res.status(200).json(recipes);
});

recipesRouter.post(
  "/",
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    const recipe = await createRecipe(req.body);
    res.status(201).json(recipe);
  },
);
