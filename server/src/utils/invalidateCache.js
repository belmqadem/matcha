import { del, keys } from "../db/redis.js";
import { CacheKeys } from "./cacheKeys.js";

export const invalidateUserCaches = async (userId) => {
  const browseKeys = await keys(CacheKeys.patterns.allBrowse(userId));
  const searchKeys = await keys(CacheKeys.patterns.allSearch(userId));

  await del(
    CacheKeys.myProfile(userId),
    CacheKeys.notifications(userId),
    ...browseKeys,
    ...searchKeys,
  );
};

export const invalidateProfileCache = async (profileId) => {
  const profileKeys = await keys(CacheKeys.patterns.allProfileViews(profileId));
  await del(CacheKeys.publicProfile(profileId), ...profileKeys);
};

export const invalidateBrowseForUser = async (userId) => {
  const browseKeys = await keys(CacheKeys.patterns.allBrowse(userId));
  const searchKeys = await keys(CacheKeys.patterns.allSearch(userId));
  await del(...browseKeys, ...searchKeys);
};
