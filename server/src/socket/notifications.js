import { query } from "../db/pool.js";
import { del as redisDel } from "../db/redis.js";
import { CacheKeys } from "../utils/cacheKeys.js";
import logger from "../utils/logger.js";

let io = null;

export const setIo = (socketIo) => {
  io = socketIo;
};

export const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

const VISIT_DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

export const emitNotification = async (toUserId, type, fromUserId) => {
  const hasValidTo = typeof toUserId === "string" && toUserId.trim().length > 0;
  const hasValidType = typeof type === "string" && type.trim().length > 0;
  const hasFrom =
    typeof fromUserId === "string" && fromUserId.trim().length > 0;

  if (!hasValidTo || !hasValidType || !hasFrom) {
    logger.error(
      { toUserId, type, fromUserId },
      "Invalid notification payload",
    );
    return;
  }

  try {
    if (type === "message") {
      // Group consecutive unread messages from the same sender into one notification
      await query(
        `INSERT INTO notifications (user_id, type, from_id, count)
         VALUES ($1, $2, $3, 1)
         ON CONFLICT (user_id, from_id, type)
           WHERE is_read = false AND type = 'message'
         DO UPDATE SET
           count = notifications.count + 1,
           created_at = NOW(),
           is_read = false`,
        [toUserId, type, fromUserId],
      );
    } else if (type === "visit") {
      const cutoff = new Date(Date.now() - VISIT_DEDUPE_WINDOW_MS);

      await query(
        `INSERT INTO notifications (user_id, type, from_id, count, created_at, is_read)
     VALUES ($1, $2, $3, 1, NOW(), false)
     ON CONFLICT (user_id, from_id, type) WHERE type = 'visit'
     DO UPDATE SET
       count = CASE
         WHEN notifications.created_at > $4 THEN notifications.count + 1
         ELSE 1
       END,
       created_at = NOW(),
       is_read = false`,
        [toUserId, type, fromUserId, cutoff],
      );
    } else {
      await query(
        `INSERT INTO notifications (user_id, type, from_id, count)
         VALUES ($1, $2, $3, 1)`,
        [toUserId, type, fromUserId],
      );
    }

    await redisDel(CacheKeys.notifications(toUserId));
  } catch (err) {
    logger.error({ err, toUserId, type }, "Failed to persist notification");
  }

  emitToUser(toUserId, "notification:new", {
    type,
    from: fromUserId,
    createdAt: new Date().toISOString(),
  });
};
