import express, { type Request, type Response } from "express";
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "../services/services.js";
import { ValidationError } from "../errors/errors.js";
import { PantryQuerySchema } from "../schema/pantry.schema.js";

export const router = express.Router({ caseSensitive: true, strict: true });

const parseId = (id: unknown): number => {
  const numberId = Number(id);
  if (typeof id == "string" && Number.isInteger(numberId) && numberId > 0)
    return numberId;
  throw new ValidationError("Invalid id");
};

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
