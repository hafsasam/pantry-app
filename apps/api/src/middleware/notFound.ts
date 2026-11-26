import { type Request, type Response, type NextFunction } from "express";
import { NotFoundError } from "../errors/errors.js";

export function notFound(req: Request, res: Response, next: NextFunction) {
  next(new NotFoundError(`Invalid path: ${req.path}`));
}
