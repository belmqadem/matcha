import { HTTP_STATUS } from "../constants/httpStatus.js";
import { query } from "../db/pool.js";
import { emitNotification } from "../socket/notifications.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import { isConnected } from "./chat.service.js";

const buildDateSelect = (userIdParamIndex) => `
  SELECT
    d.*,
    CASE
      WHEN d.proposer_id = $${userIdParamIndex} THEN 'proposer'
      ELSE 'receiver'
    END AS my_role,
    u.id           AS other_user_id,
    u.username     AS other_username,
    u.first_name   AS other_first_name,
    u.last_name    AS other_last_name,
    u.profile_picture_id AS other_profile_picture_id,
    p.url          AS other_profile_picture_url
  FROM dates d
  JOIN users u ON u.id = CASE
    WHEN d.proposer_id = $${userIdParamIndex} THEN d.receiver_id
    ELSE d.proposer_id
  END
  LEFT JOIN photos p ON p.id = u.profile_picture_id
`;

const countUpcoming = (dates) => {
  const now = new Date();
  return dates.filter((date) => {
    const scheduledAt =
      date.scheduled_at instanceof Date
        ? date.scheduled_at
        : new Date(date.scheduled_at);
    return (
      scheduledAt > now &&
      date.status !== "cancelled" &&
      date.status !== "declined"
    );
  }).length;
};

export const proposeDate = async (proposerId, payload) => {
  const { receiver_id: receiverId, scheduled_at, location } = payload;

  if (proposerId === receiverId) {
    throw new AppError(
      "Cannot propose a date to yourself",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const blockRes = await query(
    `SELECT 1 FROM blocks
     WHERE (blocker_id = $1 AND blocked_id = $2)
        OR (blocker_id = $2 AND blocked_id = $1)
     LIMIT 1`,
    [proposerId, receiverId],
  );

  if (blockRes.rows.length > 0) {
    throw new AppError("Date not found", HTTP_STATUS.NOT_FOUND);
  }

  const connected = await isConnected(proposerId, receiverId);
  if (!connected) {
    throw new AppError(
      "You must be connected to propose a date",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const pendingRes = await query(
    `SELECT id FROM dates
     WHERE status = 'pending'
       AND ((proposer_id = $1 AND receiver_id = $2)
         OR (proposer_id = $2 AND receiver_id = $1))
     LIMIT 1`,
    [proposerId, receiverId],
  );

  if (pendingRes.rows.length > 0) {
    throw new AppError(
      "A pending date already exists with this user",
      HTTP_STATUS.CONFLICT,
    );
  }

  const { rows } = await query(
    `INSERT INTO dates (proposer_id, receiver_id, scheduled_at, location)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [proposerId, receiverId, scheduled_at, location ?? null],
  );

  const date = rows[0];
  logger.info({ proposerId, receiverId, dateId: date.id }, "Date proposed");
  void emitNotification(receiverId, "date_proposed", proposerId);

  return { date };
};

export const getDates = async (userId) => {
  const { rows } = await query(
    `${buildDateSelect(1)}
     WHERE d.proposer_id = $1 OR d.receiver_id = $1
     ORDER BY d.scheduled_at ASC`,
    [userId],
  );

  return {
    dates: rows,
    upcoming: countUpcoming(rows),
    total: rows.length,
  };
};

export const getDate = async (userId, dateId) => {
  const { rows } = await query(
    `${buildDateSelect(2)}
     WHERE d.id = $1
       AND (d.proposer_id = $2 OR d.receiver_id = $2)`,
    [dateId, userId],
  );

  if (!rows.length) {
    throw new AppError("Date not found", HTTP_STATUS.NOT_FOUND);
  }

  const date = rows[0];

  const blockRes = await query(
    `SELECT 1 FROM blocks
     WHERE (blocker_id = $1 AND blocked_id = $2)
        OR (blocker_id = $2 AND blocked_id = $1)
     LIMIT 1`,
    [userId, date.other_user_id],
  );

  if (blockRes.rows.length > 0) {
    throw new AppError("Date not found", HTTP_STATUS.NOT_FOUND);
  }

  return { date };
};

export const updateDate = async (userId, dateId, updates) => {
  const { rows } = await query("SELECT * FROM dates WHERE id = $1", [dateId]);

  if (!rows.length) {
    throw new AppError("Date not found", HTTP_STATUS.NOT_FOUND);
  }

  const date = rows[0];
  if (date.receiver_id !== userId) {
    throw new AppError(
      "Only the receiver can respond to a date proposal",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  if (date.status !== "pending") {
    throw new AppError(
      "This date proposal is no longer pending",
      HTTP_STATUS.CONFLICT,
    );
  }

  const { status, scheduled_at } = updates;
  const values = [status];
  const setClauses = ["status = $1"];

  if (status === "declined" && scheduled_at) {
    values.push(scheduled_at);
    setClauses.push(`scheduled_at = $${values.length}`);
  }

  setClauses.push("updated_at = NOW()");
  values.push(dateId);

  const { rows: updatedRows } = await query(
    `UPDATE dates
     SET ${setClauses.join(", ")}
     WHERE id = $${values.length}
     RETURNING *`,
    values,
  );

  const updated = updatedRows[0];
  const notificationType =
    status === "accepted" ? "date_accepted" : "date_declined";

  logger.info({ dateId, status, receiverId: userId }, "Date proposal updated");
  void emitNotification(date.proposer_id, notificationType, userId);

  return { date: updated };
};

export const cancelDate = async (userId, dateId) => {
  const { rows } = await query("SELECT * FROM dates WHERE id = $1", [dateId]);

  if (!rows.length) {
    throw new AppError("Date not found", HTTP_STATUS.NOT_FOUND);
  }

  const date = rows[0];
  if (date.proposer_id !== userId) {
    throw new AppError(
      "Only the proposer can cancel a date",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  if (date.status === "declined" || date.status === "cancelled") {
    throw new AppError("This date cannot be cancelled", HTTP_STATUS.CONFLICT);
  }

  const { rows: updatedRows } = await query(
    `UPDATE dates
     SET status = 'cancelled', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [dateId],
  );

  const updated = updatedRows[0];
  logger.info({ dateId, proposerId: userId }, "Date cancelled");
  void emitNotification(date.receiver_id, "date_cancelled", userId);

  return { date: updated };
};

export default {
  proposeDate,
  getDates,
  getDate,
  updateDate,
  cancelDate,
};
