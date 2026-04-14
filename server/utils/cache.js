import { getRedisClient, isRedisReady } from "../configs/redis.js";

export const cacheKeys = {
  blogs: "blogs:published:all",
  blogById: (blogId) => `blogs:id:${blogId}`,
  comments: (blogId) => `comments:blog:${blogId}`,
  adminBlogs: "admin:blogs:all",
  adminComments: "admin:comments:all",
  dashboard: "admin:dashboard",
};

export const getCachedJson = async (key) => {
  if (!isRedisReady()) {
    return null;
  }

  const client = getRedisClient();
  const cachedValue = await client.get(key);
  return cachedValue ? JSON.parse(cachedValue) : null;
};

export const setCachedJson = async (key, value, ttlInSeconds = 300) => {
  if (!isRedisReady()) {
    return;
  }

  const client = getRedisClient();
  await client.set(key, JSON.stringify(value), { EX: ttlInSeconds });
};

export const deleteCacheKeys = async (keys = []) => {
  if (!isRedisReady() || keys.length === 0) {
    return;
  }

  const client = getRedisClient();
  await client.del(...keys);
};
