import { del } from "../db/redis.js";
import { createClient } from "redis";
import { CacheKeys } from "./cacheKeys.js";

const redisScanClientPromise = (() => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", () => {});

  return client.connect().then(() => client);
})();

const scanKeysByPattern = async (pattern) => {
  const client = await redisScanClientPromise;
  const matchedKeys = [];

  for await (const key of client.scanIterator({
    MATCH: pattern,
    COUNT: 100,
  })) {
    matchedKeys.push(key);
  }

  return matchedKeys;
};

export const invalidateUserCaches = async (userId) => {
  const browseKeys = await scanKeysByPattern(CacheKeys.patterns.allBrowse(userId));
  const searchKeys = await scanKeysByPattern(CacheKeys.patterns.allSearch(userId));
  const keysToDelete = [
    CacheKeys.myProfile(userId),
    CacheKeys.notifications(userId),
    ...browseKeys,
    ...searchKeys,
  ];

  if (keysToDelete.length > 0) {
    await del(...keysToDelete);
  }
};

export const invalidateProfileCache = async (profileId) => {
  const profileKeys = await scanKeysByPattern(
    CacheKeys.patterns.allProfileViews(profileId),
  );
  const keysToDelete = [CacheKeys.publicProfile(profileId), ...profileKeys];

  if (keysToDelete.length > 0) {
    await del(...keysToDelete);
  }
};

export const invalidateBrowseForUser = async (userId) => {
  const browseKeys = await scanKeysByPattern(CacheKeys.patterns.allBrowse(userId));
  const searchKeys = await scanKeysByPattern(CacheKeys.patterns.allSearch(userId));
  const keysToDelete = [...browseKeys, ...searchKeys];

  if (keysToDelete.length > 0) {
    await del(...keysToDelete);
  }
};
