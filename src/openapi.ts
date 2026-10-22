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
import {
  AllRecipesSchema,
  CreateRecipeSchema,
} from "./schema/recipe.schema.js";
import { LoginSchema, SignupSchema, UserSchema } from "./schema/auth.schema.js";

const registry = new OpenAPIRegistry();
const cookieAuth = registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "connect.sid",
});

registry.registerPath({
  method: "get",
  path: "/pantry",
  description: "Get all pantry items",
  summary: "Get pantry",
  security: [{ [cookieAuth.name]: [] }],
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
    401: {
      description: "Not logged in",
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
  security: [{ [cookieAuth.name]: [] }],
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
    401: {
      description: "Not logged in",
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
  security: [{ [cookieAuth.name]: [] }],
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
    401: {
      description: "Not logged in",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    409: {
      description: "Duplicate item",
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
  security: [{ [cookieAuth.name]: [] }],
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
    401: {
      description: "Not logged in",
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
  security: [{ [cookieAuth.name]: [] }],
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
    401: {
      description: "Not logged in",
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
  path: "/recipes/{id}/cook",
  description: "Cook a recipe",
  summary: "Cook a recipe",
  security: [{ [cookieAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "12" }),
    }),
  },
  responses: {
    200: {
      description: "Recipe cooked succesfully",
    },
    401: {
      description: "Not logged in",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    400: {
      description: "Invalid body",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Unknown recipe",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    409: {
      description: "Low stock",
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
  path: "/recipes/{id}",
  description: "Delete a recipe",
  summary: "Delete a recipe",
  security: [{ [cookieAuth.name]: [] }],
  request: {
    params: z.object({
      id: z.string().openapi({ example: "12" }),
    }),
  },
  responses: {
    204: {
      description: "Recipe deleted succesfully",
    },
    400: {
      description: "Invalid query",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: "Not logged in",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    403: {
      description: "Not an admin",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Unknown recipe",
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
  path: "/recipes",
  description: "Get all recipes",
  summary: "Get all recipes",
  security: [{ [cookieAuth.name]: [] }],
  request: {
    query: AllRecipesSchema,
  },
  responses: {
    200: {
      description: "Object with recipes data",
    },
    400: {
      description: "Invalid body",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: "Not logged in",
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
  path: "/recipes",
  description: "Create a recipe",
  summary: "Create a recipe",
  security: [{ [cookieAuth.name]: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateRecipeSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Recipe created successfully",
    },
    400: {
      description: "Invalid body",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: "Not logged in",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    403: {
      description: "Not an admin",
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
  path: "/auth/signup",
  description: "New user sign up",
  summary: "New user sign up",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignupSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
    },
    400: {
      description: "Invalid body",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    409: {
      description: "Duplicate email",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    429: {
      description: "Too many requests",
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
  path: "/auth/login",
  description: "User log in",
  summary: "User log in",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "User logged in successfully",
    },
    400: {
      description: "Invalid body",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: "Wrong credentials",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    429: {
      description: "Too many requests",
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
  path: "/auth/logout",
  description: "User log out",
  summary: "User log out",
  request: {},
  responses: {
    204: {
      description: "User logged out successfully",
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/me",
  description: "Current logged in user details",
  summary: "Current logged in user details",
  security: [{ [cookieAuth.name]: [] }],
  request: {},
  responses: {
    200: {
      description: "Current logged in user details",
    },
    401: {
      description: "Login required",
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
