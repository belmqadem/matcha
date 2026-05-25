import { del, keys } from "../db/redis.js";
import { CacheKeys } from "./cacheKeys.js";

export const invalidateUserCaches = async (userId) => {
  const browseKeys = await keys(CacheKeys.patterns.allBrowse(userId));
  const searchKeys = await keys(CacheKeys.patterns.allSearch(userId));
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
  const profileKeys = await keys(CacheKeys.patterns.allProfileViews(profileId));
  const keysToDelete = [CacheKeys.publicProfile(profileId), ...profileKeys];

  if (keysToDelete.length > 0) {
    await del(...keysToDelete);
  }
};

export const invalidateUserProfileCaches = async (userId) => {
  const keysToDelete = [CacheKeys.myProfile(userId)];

  if (keysToDelete.length > 0) {
    await del(...keysToDelete);
  }

  await invalidateProfileCache(userId);
};

export const invalidateBrowseForUser = async (userId) => {
  const browseKeys = await keys(CacheKeys.patterns.allBrowse(userId));
  const searchKeys = await keys(CacheKeys.patterns.allSearch(userId));
  const keysToDelete = [...browseKeys, ...searchKeys];

  if (keysToDelete.length > 0) {
    await del(...keysToDelete);
  }
};
