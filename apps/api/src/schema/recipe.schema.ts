import * as z from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const CreateRecipeSchema = z
  .object({
    name: z.string().min(1),
    prep_time_minutes: z.int().min(0).nullable(),
    cook_time_minutes: z.int().min(0).nullable(),
    recipeSteps: z
      .array(
        z.object({
          position: z.number().positive().min(1),
          text: z.string().min(1),
        }),
      )
      .max(100),
    recipeIngredients: z
      .array(
        z.object({
          quantity: z.number().positive(),
          unit: z.string().min(1),
          ingredient: z.object({ name: z.string().min(1) }),
        }),
      )
      .max(1000),
  })
  .openapi("CreateRecipe");

export const RecipeSchema = CreateRecipeSchema.extend({
  id: z.number(),
}).openapi("Recipe");

export const AllRecipesSchema = z
  .object({
    data: z.array(RecipeSchema),
    page: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
  })
  .openapi("AllRecipes");

export const RecipeQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1).openapi({ example: 2 }),
  })
  .openapi("RecipeQuery");

export type CreateRecipe = z.infer<typeof CreateRecipeSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type AllRecipesSchema = z.infer<typeof AllRecipesSchema>;
