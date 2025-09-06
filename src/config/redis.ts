import Redis from "ioredis";
import { env } from "./env";

export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    })
  : new Redis(); // local default

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (e) => console.error("Redis error", e));
