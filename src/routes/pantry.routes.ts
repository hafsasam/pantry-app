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
  const pantry = await getAllItems(page, needs_restocking);
  res.json(pantry);
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsedId: number = parseId(id);
  const item = await getItemById(parsedId);
  res.json(item);
});

router.post("/", async (req: Request, res: Response) => {
  const item = await createItem(req.body);
  res.status(201).json(item);
});

router.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const parsedId: number = parseId(id);
  const item = await updateItem(parsedId, req.body);
  res.json(item);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsedId: number = parseId(id);
  await deleteItem(parsedId);
  res.sendStatus(204);
});
