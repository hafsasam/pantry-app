import pino from "pino";

const base = {
  redact: ["req.headers.cookie", 'res.headers["set-cookie"]'],
};

export const logger = pino({
  ...base,
  ...(process.env.NODE_ENV === "dev"
    ? { transport: { target: "pino-pretty" } }
    : {}),
  ...(process.env.NODE_ENV === "test" ? { level: "silent" } : {}),
});
