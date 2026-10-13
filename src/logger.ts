import pino from "pino";

export const logger = pino(
  process.env.NODE_ENV === "dev"
    ? {
        transport: {
          target: "pino-pretty",
        },
      }
    : process.env.NODE_ENV === "test"
      ? { level: "silent" }
      : {},
);
