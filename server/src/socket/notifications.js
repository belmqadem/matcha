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
    await query(
      `INSERT INTO notifications (user_id, type, from_id)
       VALUES ($1, $2, $3)`,
      [toUserId, type, fromUserId],
    );

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
