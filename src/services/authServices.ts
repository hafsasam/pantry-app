import * as argon2 from "argon2";
import { LoginSchema, SignupSchema, type User } from "../schema/auth.schema.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../data/usersData.js";
import { UnauthorizedError } from "../errors/errors.js";

export const signup = async (body: unknown): Promise<User> => {
  const parsedBody = SignupSchema.parse(body);
  const hash = await argon2.hash(parsedBody.password);
  return createUser(parsedBody.email, hash);
};

export const login = async (body: unknown): Promise<User> => {
  const parsedBody = LoginSchema.parse(body);
  const { email, password } = parsedBody;
  const user = await findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError("Invalid credentials.");
  }
  const verifyHash = await argon2.verify(user.password_hash, password);
  if (!verifyHash) {
    throw new UnauthorizedError("Invalid credentials.");
  }

  return { id: user.id, created_at: user.created_at, email: user.email };
};

export const getUserById = async (userId: number): Promise<User> => {
  return await findUserById(userId);
};
