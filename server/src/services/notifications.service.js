import { HTTP_STATUS } from "../constants/httpStatus.js";
import { query } from "../db/pool.js";
import {
  get as redisGet,
  set as redisSet,
  del as redisDel,
} from "../db/redis.js";
import AppError from "../utils/AppError.js";
import { CacheKeys } from "../utils/cacheKeys.js";
import logger from "../utils/logger.js";

const parseNotificationId = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError("Invalid notification ID", HTTP_STATUS.BAD_REQUEST);
  }
  return parsed;
};

export const getNotifications = async (userId) => {
  const cacheKey = CacheKeys.notifications(userId);
  const cached = await redisGet(cacheKey);
  if (cached) {
    logger.debug({ userId }, "Cache hit: notifications");
    return cached;
  }

  const { rows: notifications } = await query(
    `SELECT
      n.id,
      n.type,
      n.is_read,
			n.count,
      n.created_at,
      u.id        AS from_id,
      u.username  AS from_username,
      u.first_name AS from_first_name,
      u.last_name  AS from_last_name,
      u.profile_picture_id AS from_profile_picture_id,
      p.url AS from_profile_picture_url
     FROM notifications n
     LEFT JOIN users u ON u.id = n.from_id
         LEFT JOIN photos p ON p.id = u.profile_picture_id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT 50`,
    [userId],
  );

  const unreadRes = await query(
    `SELECT COUNT(*)::int AS count
     FROM notifications
     WHERE user_id = $1 AND is_read = false`,
    [userId],
  );

  const result = {
    notifications,
    unread_count: unreadRes.rows[0]?.count ?? 0,
  };

  await redisSet(cacheKey, result, 30);
  return result;
};

export const markAllAsRead = async (userId) => {
  const result = await query(
    `UPDATE notifications
     SET is_read = true
     WHERE user_id = $1 AND is_read = false`,
    [userId],
  );

  await redisDel(CacheKeys.notifications(userId));
  return { updated: result.rowCount };
};

export const markOneAsRead = async (userId, notificationId) => {
  const id = parseNotificationId(notificationId);
  const result = await query(
    `UPDATE notifications
     SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, userId],
  );

  if (!result.rows.length) {
    throw new AppError("Notification not found", HTTP_STATUS.NOT_FOUND);
  }

  await redisDel(CacheKeys.notifications(userId));
  return { id };
};

export const deleteNotification = async (userId, notificationId) => {
  const id = parseNotificationId(notificationId);
  const result = await query(
    `DELETE FROM notifications
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, userId],
  );

  if (!result.rows.length) {
    throw new AppError("Notification not found", HTTP_STATUS.NOT_FOUND);
  }

  await redisDel(CacheKeys.notifications(userId));
  return { deleted: true };
};

export default {
  getNotifications,
  markAllAsRead,
  markOneAsRead,
  deleteNotification,
};
