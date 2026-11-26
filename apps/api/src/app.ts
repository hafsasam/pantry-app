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
import { authRouter } from "./routes/auth.routes.js";
import session, { type SessionOptions } from "express-session";
import connectPgSimple from "connect-pg-simple";
import { requireAuth } from "./middleware/requireAuth.js";
import helmet from "helmet";

const app = express();

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error(
    "SESSION_SECRET is not set. Add it to your .env file (see .env.example)",
  );
}

const corsVar = process.env.CORS_ORIGINS;
if (!corsVar) {
  throw new Error(
    "CORS_ORIGINS is not set. Add it to your .env file (see .env.example)",
  );
}
const corsOrigins = corsVar.split(",").map((o: string) => o.trim());

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add it to your .env file (see .env.example)",
  );
}

const env = process.env.NODE_ENV;
if (!env) {
  throw new Error(
    "NODE_ENV is not set. Add it to your .env file (see .env.example)",
  );
}

const PgStore = connectPgSimple(session);
const sess: SessionOptions = {
  store: new PgStore({
    conString: dbUrl,
    createTableIfMissing: false,
  }),
  secret: sessionSecret,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env === "production",
    maxAge: 1000 * 60 * 60 * 24 * 14,
  },
  saveUninitialized: false,
  resave: false,
};

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

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(session(sess));
app.use(helmet());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(document));
app.use("/pantry", requireAuth, pantryRouter);
app.use("/recipes", requireAuth, recipesRouter);
app.use("/auth", authRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
