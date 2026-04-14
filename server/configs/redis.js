import { createClient } from "redis";

let redisClient;
let redisEnabled = false;

export const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn("REDIS_URL is not configured. Redis cache is disabled.");
    return null;
  }

  redisClient = createClient({ url: redisUrl });

  redisClient.on("error", (error) => {
    redisEnabled = false;
    console.error("Redis error:", error.message);
  });

  redisClient.on("ready", () => {
    redisEnabled = true;
    console.log("Redis connected");
  });

  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    redisEnabled = false;
    console.warn("Redis connection failed. Continuing without cache.");
    console.warn(error.message);
    return null;
  }
};

export const getRedisClient = () => redisClient;

export const isRedisReady = () =>
  Boolean(redisClient?.isOpen) && redisEnabled;
