import winston from "winston";
import { env } from "./env";

const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message, ...meta }) =>
        `${timestamp} [${level}] ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ""
        }`
    )
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
