import { type Request, type Response, type NextFunction } from "express";
import { UnauthorizedError } from "../errors/errors.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    throw new UnauthorizedError("Login required");
  }
  next();
}
