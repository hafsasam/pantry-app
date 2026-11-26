import * as z from "zod";

const PantryInputSchema = z.object({
  name: z.string().min(1).meta({ example: "milk" }),
  quantity: z.number().nonnegative().meta({ example: 3.5 }),
  unit: z.string().min(1).meta({ example: "kg" }),
  needs_restocking: z.boolean().meta({ example: true }),
});

export const CreatePantrySchema = PantryInputSchema.extend({
  needs_restocking: z.boolean().default(false).meta({ example: true }),
}).meta({ id: "CreatePantry" });

export const PantryItemSchema = CreatePantrySchema.extend({
  id: z.number().meta({ example: 13 }),
}).meta({ id: "PantryItem" });

export const PartialPantrySchema = PantryInputSchema.omit({ name: true })
  .exactPartial()
  .strict()
  .refine((val) => Object.keys(val).length > 0, {
    error: "No empty objects allowed! Provide at least one field to update",
  })
  .meta({ id: "PartialPantry" });

export const PantryQuerySchema = z
  .object({
    needs_restocking: z.stringbool().optional().meta({ example: false }),
    page: z.coerce.number().int().min(1).default(1).meta({ example: 2 }),
  })
  .meta({ id: "PantryQuery" });

export const ErrorSchema = z
  .object({
    error: z.string(),
    details: z.array(z.string()).optional(),
  })
  .meta({ id: "Error" });

export const AllPantrySchema = z
  .object({
    data: z.array(PantryItemSchema),
    page: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
  })
  .meta({ id: "AllPantry" });

export type PantryItem = z.infer<typeof PantryItemSchema>;
export type PartialPantryItem = z.infer<typeof PartialPantrySchema>;
export type AllPantryItems = z.infer<typeof AllPantrySchema>;
