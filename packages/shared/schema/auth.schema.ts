import * as z from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email())
  .meta({ example: "me@me.com" });

export const SignupSchema = z.object({
  email,
  password: z.string().min(8).max(128),
});

export const UserSchema = z.object({
  email,
  id: z.number(),
  created_at: z.date(),
  role: z.enum(["ADMIN", "USER"]),
});

export const LoginSchema = SignupSchema.extend({
  password: z.string(),
});

export type User = z.infer<typeof UserSchema>;
