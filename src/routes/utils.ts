import { ValidationError } from "../errors/errors.js";

export const parseId = (id: unknown): number => {
  const numberId = Number(id);
  if (typeof id == "string" && Number.isInteger(numberId) && numberId > 0)
    return numberId;
  throw new ValidationError("Invalid id");
};
