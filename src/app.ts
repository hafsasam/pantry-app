import express, { type Request, type Response } from "express";
import { router as pantryRouter } from "./routes/pantry.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import swaggerUi from "swagger-ui-express";
import { document } from "./openapi.js";
import { pinoHttp } from "pino-http";
import { logger } from "./logger.js";
import cors from "cors";
import { recipesRouter } from "./routes/recipes.routes.js";

const app = express();

app.use(
  pinoHttp({
    logger,
    customLogLevel: function (req: Request, res: Response, err?: Error) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return "warn";
      } else if (res.statusCode >= 500 || err) {
        return "error";
      }
      return "info";
    },
  }),
);
app.use(cors());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(document));
app.use("/pantry", express.json());
app.use("/pantry", pantryRouter);
app.use("/recipes", recipesRouter);
app.use(notFound);
app.use(errorHandler);

export { app };
