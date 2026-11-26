import express, { type Request, type Response } from "express";
import { PantryQuerySchema } from "../schema/pantry.schema.js";
import {
  createItem,
  deleteItem,
  getAllItems,
  getItemById,
  updateItem,
} from "../services/services.js";
import { parseId } from "./utils.js";

export const router = express.Router({ caseSensitive: true, strict: true });

router.get("/", async (req: Request, res: Response) => {
  const { page, needs_restocking } = PantryQuerySchema.parse(req.query);
  const userId = req.session.userId!;
  const pantry = await getAllItems(page, userId, needs_restocking);
  res.json(pantry);
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.session.userId!;
  const parsedId: number = parseId(id);
  const item = await getItemById(parsedId, userId);
  res.json(item);
});

router.post("/", async (req: Request, res: Response) => {
  const userId = req.session.userId!;
  const item = await createItem(req.body, userId);
  res.status(201).json(item);
});

router.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.session.userId!;

  const parsedId: number = parseId(id);
  const item = await updateItem(parsedId, req.body, userId);
  res.json(item);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.session.userId!;
  const parsedId: number = parseId(id);
  await deleteItem(parsedId, userId);
  res.sendStatus(204);
});
