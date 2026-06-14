import { HTTP_STATUS } from "../constants/httpStatus.js";
import { query } from "../db/pool.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

export const isConnected = async (userAId, userBId) => {
  const { rows } = await query(
    `SELECT 1 FROM likes WHERE liker_id = $1 AND liked_id = $2
     INTERSECT
     SELECT 1 FROM likes WHERE liker_id = $2 AND liked_id = $1`,
    [userAId, userBId],
  );
  return rows.length > 0;
};

const hasBlock = async (userAId, userBId) => {
  const { rows } = await query(
    `SELECT 1 FROM blocks
     WHERE (blocker_id = $1 AND blocked_id = $2)
        OR (blocker_id = $2 AND blocked_id = $1)
     LIMIT 1`,
    [userAId, userBId],
  );
  return rows.length > 0;
};

const normalizeContent = (content) => {
  if (typeof content !== "string") {
    throw new AppError("Invalid message", HTTP_STATUS.BAD_REQUEST);
  }

  const trimmed = content.trim();
  if (!trimmed) {
    throw new AppError("Message cannot be empty", HTTP_STATUS.BAD_REQUEST);
  }

  if (trimmed.length > 1000) {
    throw new AppError("Message is too long", HTTP_STATUS.BAD_REQUEST);
  }

  return trimmed;
};

export const sendMessage = async (senderId, receiverId, content) => {
  const normalized = normalizeContent(content);

  const connected = await isConnected(senderId, receiverId);
  if (!connected) {
    throw new AppError(
      "You are not connected with this user",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const blocked = await hasBlock(senderId, receiverId);
  if (blocked) {
    throw new AppError(
      "You are not connected with this user",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const { rows } = await query(
    `INSERT INTO messages (sender_id, receiver_id, content)
     VALUES ($1, $2, $3)
     RETURNING id, sender_id, receiver_id, content, is_read, sent_at`,
    [senderId, receiverId, normalized],
  );

  logger.info({ senderId, receiverId }, "Message sent");

  return rows[0];
};

export const getConversations = async (userId) => {
  const { rows } = await query(
    `SELECT
      u.id,
      u.username,
      u.first_name,
      u.last_name,
      u.profile_picture_id,
      p.url AS profile_picture_url,
      u.is_online,
      m.content       AS last_message,
      m.sent_at       AS last_message_at,
      m.sender_id     AS last_message_sender_id,
      COUNT(unread.id)::int AS unread_count
    FROM users u
    LEFT JOIN photos p ON p.id = u.profile_picture_id
    JOIN LATERAL (
      SELECT id, content, sent_at, sender_id
      FROM messages
      WHERE (sender_id = u.id AND receiver_id = $1)
         OR (sender_id = $1 AND receiver_id = u.id)
      ORDER BY sent_at DESC
      LIMIT 1
    ) m ON true
    LEFT JOIN messages unread
      ON unread.sender_id = u.id
      AND unread.receiver_id = $1
      AND unread.is_read = false
    WHERE EXISTS (
      SELECT 1 FROM messages
      WHERE (sender_id = $1 AND receiver_id = u.id)
         OR (sender_id = u.id AND receiver_id = $1)
    )
    GROUP BY u.id, u.username, u.first_name, u.last_name,
             u.profile_picture_id, p.url, u.is_online,
             m.content, m.sent_at, m.sender_id
    ORDER BY m.sent_at DESC`,
    [userId],
  );

  return rows;
};

export const getUnreadCount = async (userId) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM messages
     WHERE receiver_id = $1 AND is_read = false`,
    [userId],
  );

  return rows[0]?.count ?? 0;
};

export const getMessages = async (userId, otherUserId, page, limit) => {
  const connected = await isConnected(userId, otherUserId);
  if (!connected) {
    throw new AppError("Not connected", HTTP_STATUS.FORBIDDEN);
  }

  const offset = (page - 1) * limit;

  const countRes = await query(
    `SELECT COUNT(*)::int AS total
     FROM messages
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)`,
    [userId, otherUserId],
  );

  const { rows } = await query(
    `SELECT id, sender_id, receiver_id, content, is_read, sent_at
     FROM messages
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)
     ORDER BY sent_at DESC
     LIMIT $3 OFFSET $4`,
    [userId, otherUserId, limit, offset],
  );

  return {
    messages: rows.reverse(),
    total: countRes.rows[0]?.total ?? 0,
    page,
    limit,
  };
};

export const markAsRead = async (userId, fromUserId) => {
  const result = await query(
    `UPDATE messages
     SET is_read = true
     WHERE receiver_id = $1
       AND sender_id = $2
       AND is_read = false`,
    [userId, fromUserId],
  );

  return result.rowCount;
};

export default {
  isConnected,
  sendMessage,
  getConversations,
  getUnreadCount,
  getMessages,
  markAsRead,
};
