import { ConflictError, NotFoundError } from "../errors/errors.js";
import { prisma } from "../prisma.js";
import type { User } from "../schema/auth.schema.js";
import { Prisma } from "../generated/prisma/client.js";
import type { Prisma as PrismaType } from "../generated/prisma/client.js";

export type UserWithHash = PrismaType.UserGetPayload<null>;

export const createUser = async (
  email: string,
  passwordHash: string,
): Promise<User> => {
  try {
    return await prisma.user.create({
      data: { email, password_hash: passwordHash, role: "USER" },
      select: { id: true, email: true, created_at: true, role: true },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new ConflictError("An account with this email already exists");
    }
    throw err;
  }
};

export const findUserByEmail = async (
  email: string,
): Promise<UserWithHash | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user;
};

export const findUserById = async (id: number): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      created_at: true,
      role: true,
    },
  });

  if (user === null) {
    throw new NotFoundError(`Could not find the user with id ${id}`);
  } else {
    return user;
  }
};
