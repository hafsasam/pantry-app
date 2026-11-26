import express, { type Request, type Response } from "express";
import { getUserById, login, signup } from "../services/authServices.js";
import { UnauthorizedError } from "../errors/errors.js";
import { createLoginLimiter } from "../middleware/loginLimiter.js";

export const authRouter = express.Router({
  caseSensitive: true,
  strict: true,
});

const parsed = Number(process.env.LOGIN_RATE_LIMIT);
const loginRateLimit = Number.isInteger(parsed) && parsed > 0 ? parsed : 5;
const loginLimiter = createLoginLimiter(loginRateLimit);

authRouter.post(
  "/signup",
  loginLimiter,
  async (req: Request, res: Response) => {
    const user = await signup(req.body);
    res.status(201).json(user);
  },
);

authRouter.post("/login", loginLimiter, async (req: Request, res: Response) => {
  const user = await login(req.body);
  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
  });
  req.session.userId = user.id;
  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });
  res.json(user);
});

authRouter.post("/logout", async (req: Request, res: Response) => {
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });
  res.clearCookie("connect.sid");
  res.sendStatus(204);
});

authRouter.get("/me", async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (userId == null) {
    throw new UnauthorizedError("Login required");
  }
  const user = await getUserById(userId);
  res.status(200).json(user);
});
