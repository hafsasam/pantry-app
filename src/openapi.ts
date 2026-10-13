import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import {
  ErrorSchema,
  PantryItemSchema,
  AllPantrySchema,
  PantryQuerySchema,
  CreatePantrySchema,
  PartialPantrySchema,
} from "./schema/pantry.schema.js";
import * as z from "zod";

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "get",
  path: "/pantry",
  description: "Get all pantry items",
  summary: "Get pantry",
  request: {
    query: PantryQuerySchema,
  },
  responses: {
    200: {
      description: "Object with pantry data.",
      content: {
        "application/json": {
          schema: AllPantrySchema,
        },
      },
    },
    400: {
      description: "Invalid query params",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/pantry/{id}",
  description: "Get specific pantry item",
  summary: "Get pantry item",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "12" }),
    }),
  },
  responses: {
    200: {
      description: "Object with pantry data with the requested id.",
      content: {
        "application/json": {
          schema: PantryItemSchema,
        },
      },
    },
    400: {
      description: "Validation failed",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Item with id was not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/pantry",
  description: "Create new pantry item",
  summary: "Create pantry item",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePantrySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Pantry item created successfully.",
      content: {
        "application/json": {
          schema: PantryItemSchema,
        },
      },
    },
    400: {
      description: "Validation failed",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/pantry/{id}",
  description: "Update pantry item",
  summary: "Update pantry item",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "12" }),
    }),
    body: {
      content: {
        "application/json": {
          schema: PartialPantrySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Pantry item updated successfully.",
      content: {
        "application/json": {
          schema: PantryItemSchema,
        },
      },
    },
    400: {
      description: "Validation failed",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Item with id was not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/pantry/{id}",
  description: "Delete pantry item",
  summary: "Delete pantry item",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "12" }),
    }),
  },
  responses: {
    204: {
      description: "Pantry item deleted successfully.",
    },
    400: {
      description: "Validation failed",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Item with id was not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const document = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Pantry API",
    description: "This is the Pantry API",
  },
});
