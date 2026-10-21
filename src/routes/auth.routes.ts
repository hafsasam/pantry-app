import express, { type Request, type Response } from "express";
import { getUserById, login, signup } from "../services/authServices.js";

export const authRouter = express.Router({
  caseSensitive: true,
  strict: true,
});

authRouter.post("/signup", async (req: Request, res: Response) => {
  const user = await signup(req.body);
  res.status(201).json(user);
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const user = await login(req.body);
  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
  });
  req.session.userId = user.id;
  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });
  res.status(200).json(user);
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
    return res.sendStatus(401);
  }
  const user = await getUserById(userId);
  res.status(200).json(user);
});
