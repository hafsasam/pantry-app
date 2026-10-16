import { type Request, type Response, type NextFunction } from "express";
import { NotFoundError, ValidationError } from "../errors/errors.js";
import { ZodError } from "zod";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof ZodError) {
    err.issues.map((issue) => req.log.warn(issue.message));
    res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((issue) =>
        issue.path.length > 0
          ? `${issue.path}: ${issue.message}`
          : issue.message,
      ),
    });
  } else if (err instanceof ValidationError) {
    req.log.warn(err.message);
    res.status(400).json({ error: err.message });
  } else if (err instanceof NotFoundError) {
    req.log.warn(err.message);
    res.status(404).json({ error: err.message });
  } else if ("status" in err && err.status === 400) {
    res.status(400).json({ error: "Malformed JSON body" });
  } else if ("code" in err && err.code == "23505") {
    res.status(409).json({ error: "Item already created" });
  } else {
    req.log.error(err);
    res.status(500).json({ error: "There was an issue handling your request" });
  }
}
