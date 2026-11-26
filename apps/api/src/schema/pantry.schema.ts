import * as z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const PantryInputSchema = z.object({
  name: z.string().min(1).openapi({ example: "milk" }),
  quantity: z.number().nonnegative().openapi({ example: 3.5 }),
  unit: z.string().min(1).openapi({ example: "kg" }),
  needs_restocking: z.boolean().openapi({ example: true }),
});

export const CreatePantrySchema = PantryInputSchema.extend({
  needs_restocking: z.boolean().default(false).openapi({ example: true }),
}).openapi("CreatePantry");

export const PantryItemSchema = CreatePantrySchema.extend({
  id: z.number().openapi({ example: 13 }),
}).openapi("PantryItem");

export const PartialPantrySchema = PantryInputSchema.omit({ name: true })
  .exactPartial()
  .strict()
  .refine((val) => Object.keys(val).length > 0, {
    error: "No empty objects allowed! Provide at least one field to update",
  })
  .openapi("PartialPantry");

export const PantryQuerySchema = z
  .object({
    needs_restocking: z.stringbool().optional().openapi({ example: false }),
    page: z.coerce.number().int().min(1).default(1).openapi({ example: 2 }),
  })
  .openapi("PantryQuery");

export const ErrorSchema = z
  .object({
    error: z.string(),
    details: z.array(z.string()).optional(),
  })
  .openapi("Error");

export const AllPantrySchema = z
  .object({
    data: z.array(PantryItemSchema),
    page: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
  })
  .openapi("AllPantry");

export type PantryItem = z.infer<typeof PantryItemSchema>;
export type PartialPantryItem = z.infer<typeof PartialPantrySchema>;
export type AllPantryItems = z.infer<typeof AllPantrySchema>;
