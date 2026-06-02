export const CacheKeys = {
  // User's own profile
  myProfile: (userId) => `user:${userId}:me`,

  // Public profile viewed by someone
  publicProfile: (profileId) => `profile:${profileId}:public`,

  // Browse results <keyed by user + serialized query params>
  browse: (userId, params) => `browse:${userId}:${JSON.stringify(params)}`,

  // Search results <keyed by user + serialized query params>
  search: (userId, params) => `search:${userId}:${JSON.stringify(params)}`,

  // Notifications list
  notifications: (userId) => `notifications:${userId}`,

  // JWT blocklist entry
  blocklist: (jti) => `blocklist:${jti}`,

  // Online status
  online: (userId) => `online:${userId}`,

  // Patterns for bulk invalidation
  patterns: {
    allBrowse: (userId) => `browse:${userId}:*`,
    allSearch: (userId) => `search:${userId}:*`,
    allProfileViews: (profileId) => `profile:${profileId}:*`,
  },
};
