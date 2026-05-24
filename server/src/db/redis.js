import Redis from "ioredis";
import env from "../config/env.js";
import logger from "../utils/logger.js";

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis error");
});

redis.on("close", () => {
  logger.warn("Redis connection closed");
});

export const get = async (key) => {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    logger.error({ err, key }, "Redis get failed");
    return null;
  }
};

export const set = async (key, value, ttlSeconds) => {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    logger.error({ err, key }, "Redis set failed");
  }
};

export const del = async (...keys) => {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch (err) {
    logger.error({ err, keys }, "Redis del failed");
  }
};

export const keys = async (pattern) => {
  try {
    return await redis.keys(pattern);
  } catch (err) {
    logger.error({ err, pattern }, "Redis keys failed");
    return [];
  }
};

export default redis;
