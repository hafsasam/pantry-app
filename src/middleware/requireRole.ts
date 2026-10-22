import { type Request, type Response, type NextFunction } from "express";
import type { Role } from "../generated/prisma/enums.js";
import { getUserById } from "../services/authServices.js";
import { ForbiddenError } from "../errors/errors.js";

export const requireRole =
  (role: Role) => async (req: Request, res: Response, next: NextFunction) => {
    // load the user's role from the DB (option b), using req.session.userId
    // wrong role → throw ForbiddenError; otherwise next()
    const userId = req.session.userId!;
    const user = await getUserById(userId);
    if (user.role === role) {
      next();
    } else {
      throw new ForbiddenError("You do not have access");
    }
  };
