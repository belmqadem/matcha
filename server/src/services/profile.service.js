import { query, getClient } from "../db/pool.js";
import AppError from "../utils/AppError.js";
import { recalculateFameRating } from "../utils/fameRating.js";
import { emitNotification } from "../socket/notifications.js";
import { haversineKm } from "../utils/haversine.js";
import { getMe } from "./users.service.js";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "..", "uploads");
const MAX_PHOTOS = 5;

const ensureUploadsDir = async () => {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
};

const getPhotoCount = async (userId) => {
  const { rows } = await query(
    "SELECT COUNT(*)::int AS count FROM photos WHERE user_id = $1",
    [userId],
  );
  return rows[0]?.count ?? 0;
};

const getNextOrderIndex = async (userId) => {
  const { rows } = await query(
    "SELECT COALESCE(MAX(order_index), 0) + 1 AS next_index FROM photos WHERE user_id = $1",
    [userId],
  );
  return Number(rows[0]?.next_index ?? 1);
};

const mapPhotoFormat = (mimetype) => {
  if (mimetype === "image/jpeg") {
    return { ext: "jpg", format: "jpeg" };
  }
  if (mimetype === "image/png") {
    return { ext: "png", format: "png" };
  }
  if (mimetype === "image/webp") {
    return { ext: "webp", format: "webp" };
  }
  return null;
};

const assertUserExists = async (userId) => {
  const { rows } = await query("SELECT 1 FROM users WHERE id = $1", [userId]);
  if (!rows.length) {
    throw new AppError("User not found", 404);
  }
};

const getBlockStatus = async (viewerId, targetId) => {
  const { rows } = await query(
    `SELECT blocker_id, blocked_id
     FROM blocks
     WHERE (blocker_id = $1 AND blocked_id = $2)
        OR (blocker_id = $2 AND blocked_id = $1)`,
    [viewerId, targetId],
  );

  const isBlocked = rows.length > 0;
  const isBlockedByMe = rows.some((row) => row.blocker_id === viewerId);
  return { isBlocked, isBlockedByMe };
};

const runQuery = (client, text, params) =>
  client ? client.query(text, params) : query(text, params);

const notifyUser = async (toUserId, type, fromUserId, client = null) => {
  emitNotification(toUserId, type, fromUserId).catch((err) => {
    logger.error(
      { err, toUserId, type, fromUserId },
      "Failed to emit notification",
    );
  });
  await runQuery(
    client,
    `INSERT INTO notifications (user_id, type, from_id)
     VALUES ($1, $2, $3)`,
    [toUserId, type, fromUserId],
  );
};

const toNumberOrNull = (value) =>
  value === null || value === undefined ? null : Number(value);

const calculateDistanceKm = (viewer, target) => {
  const viewerLat = toNumberOrNull(viewer?.latitude);
  const viewerLng = toNumberOrNull(viewer?.longitude);
  const targetLat = toNumberOrNull(target?.latitude);
  const targetLng = toNumberOrNull(target?.longitude);

  if (
    viewerLat === null ||
    viewerLng === null ||
    targetLat === null ||
    targetLng === null
  ) {
    return null;
  }

  const distance = haversineKm(viewerLat, viewerLng, targetLat, targetLng);
  return Math.round(distance * 10) / 10;
};

export const updateProfile = async (userId, updates) => {
  const setClauses = [];
  const values = [];

  const setField = (key, value) => {
    values.push(value);
    setClauses.push(`${key} = $${values.length}`);
  };

  if (updates.gender !== undefined) {
    setField("gender", updates.gender);
  }
  if (updates.sexual_preference !== undefined) {
    setField("sexual_preference", updates.sexual_preference);
  }
  if (updates.biography !== undefined) {
    setField("biography", updates.biography);
  }
  if (updates.latitude !== undefined) {
    setField("latitude", Math.round(updates.latitude * 100) / 100);
  }
  if (updates.longitude !== undefined) {
    setField("longitude", Math.round(updates.longitude * 100) / 100);
  }
  if (updates.location_city !== undefined) {
    setField("location_city", updates.location_city);
  }
  if (updates.birth_date !== undefined) {
    setField("birth_date", updates.birth_date);
  }

  if (setClauses.length > 0) {
    values.push(userId);
    const sql = `UPDATE users SET ${setClauses.join(", ")}, updated_at = NOW() WHERE id = $${values.length}`;
    await query(sql, values);
  }

  await recalculateFameRating(userId);
  return getMe(userId);
};

export const updateTags = async (userId, tags) => {
  const client = await getClient();

  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM user_tags WHERE user_id = $1", [userId]);

    if (tags.length > 0) {
      await client.query(
        "INSERT INTO tags (name) SELECT unnest($1::text[]) ON CONFLICT DO NOTHING",
        [tags],
      );

      const { rows: tagRows } = await client.query(
        "SELECT id FROM tags WHERE name = ANY($1::text[])",
        [tags],
      );

      const tagIds = tagRows.map((row) => row.id);

      if (tagIds.length > 0) {
        await client.query(
          "INSERT INTO user_tags (user_id, tag_id) SELECT $1, unnest($2::int[]) ON CONFLICT DO NOTHING",
          [userId, tagIds],
        );
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  await recalculateFameRating(userId);
  return tags;
};

export const uploadPhoto = async (userId, file) => {
  if (!file) {
    throw new AppError("Photo is required", 400);
  }

  const count = await getPhotoCount(userId);
  if (count >= MAX_PHOTOS) {
    throw new AppError("Photo limit reached", 400);
  }

  const format = mapPhotoFormat(file.mimetype);
  if (!format) {
    throw new AppError("Invalid file type", 400);
  }

  await ensureUploadsDir();

  const filename = `${crypto.randomUUID()}.${format.ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  let image = sharp(file.buffer).rotate().resize({
    width: 1200,
    withoutEnlargement: true,
  });

  if (format.format === "jpeg") {
    image = image.jpeg({ quality: 80 });
  } else if (format.format === "png") {
    image = image.png({ quality: 80 });
  } else {
    image = image.webp({ quality: 80 });
  }

  await image.toFile(filePath);

  const orderIndex = await getNextOrderIndex(userId);
  const url = `/uploads/${filename}`;

  const insertRes = await query(
    `INSERT INTO photos (user_id, filename, url, order_index)
     VALUES ($1, $2, $3, $4)
     RETURNING id, url, order_index, created_at`,
    [userId, filename, url, orderIndex],
  );

  const userRes = await query(
    "SELECT profile_picture_id FROM users WHERE id = $1",
    [userId],
  );

  if (userRes.rows.length && !userRes.rows[0].profile_picture_id) {
    await query("UPDATE users SET profile_picture_id = $1 WHERE id = $2", [
      insertRes.rows[0].id,
      userId,
    ]);
  }

  await recalculateFameRating(userId);
  return insertRes.rows[0];
};

export const deletePhoto = async (userId, photoId) => {
  const id = Number(photoId);
  if (!Number.isInteger(id)) {
    throw new AppError("Invalid photo id", 400);
  }

  const client = await getClient();
  let filePath = null;

  try {
    await client.query("BEGIN");

    const photoRes = await client.query(
      "SELECT id, url FROM photos WHERE id = $1 AND user_id = $2",
      [id, userId],
    );

    if (!photoRes.rows.length) {
      throw new AppError("Photo not found", 404);
    }

    const photo = photoRes.rows[0];
    const filename = path.basename(photo.url);
    filePath = path.join(UPLOADS_DIR, filename);

    const userRes = await client.query(
      "SELECT profile_picture_id FROM users WHERE id = $1",
      [userId],
    );

    const currentMain = userRes.rows[0]?.profile_picture_id;
    const wasMain = Number(currentMain) === id;

    await client.query("DELETE FROM photos WHERE id = $1 AND user_id = $2", [
      id,
      userId,
    ]);

    if (wasMain) {
      const nextRes = await client.query(
        "SELECT id FROM photos WHERE user_id = $1 ORDER BY order_index LIMIT 1",
        [userId],
      );
      const nextId = nextRes.rows[0]?.id ?? null;
      await client.query(
        "UPDATE users SET profile_picture_id = $1 WHERE id = $2",
        [nextId, userId],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  if (filePath) {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
  }

  await recalculateFameRating(userId);
  return true;
};

export const setMainPhoto = async (userId, photoId) => {
  const id = Number(photoId);
  if (!Number.isInteger(id)) {
    throw new AppError("Invalid photo id", 400);
  }

  const photoRes = await query(
    "SELECT id FROM photos WHERE id = $1 AND user_id = $2",
    [id, userId],
  );

  if (!photoRes.rows.length) {
    throw new AppError("Photo not found", 404);
  }

  await query("UPDATE users SET profile_picture_id = $1 WHERE id = $2", [
    id,
    userId,
  ]);

  return true;
};

export const getVisitors = async (userId) => {
  const { rows } = await query(
    `SELECT v.visited_at,
            u.id, u.username, u.first_name, u.last_name,
            u.gender, u.biography, u.fame_rating, u.profile_picture_id
     FROM visits v
     JOIN users u ON u.id = v.visitor_id
     WHERE v.visited_id = $1
     ORDER BY v.visited_at DESC`,
    [userId],
  );

  return rows;
};

export const getLikedBy = async (userId) => {
  const { rows } = await query(
    `SELECT l.created_at,
            u.id, u.username, u.first_name, u.last_name,
            u.gender, u.biography, u.fame_rating, u.profile_picture_id
     FROM likes l
     JOIN users u ON u.id = l.liker_id
     WHERE l.liked_id = $1
     ORDER BY l.created_at DESC`,
    [userId],
  );

  return rows;
};

export const getPublicProfile = async (viewerId, targetId) => {
  const isSelf = viewerId === targetId;

  const userRes = await query(
    `SELECT id, username, first_name, last_name,
            gender, sexual_preference, biography, fame_rating,
            location_city, is_online, last_seen, profile_picture_id,
            birth_date, created_at, latitude, longitude
     FROM users
     WHERE id = $1`,
    [targetId],
  );

  if (!userRes.rows.length) {
    throw new AppError("User not found", 404);
  }

  const userRow = userRes.rows[0];
  let isBlockedByMe = false;

  if (!isSelf) {
    const blockStatus = await getBlockStatus(viewerId, targetId);
    if (blockStatus.isBlocked) {
      throw new AppError("User not found", 404);
    }
    isBlockedByMe = blockStatus.isBlockedByMe;

    await query(
      `INSERT INTO visits (visitor_id, visited_id, visited_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (visitor_id, visited_id)
       DO UPDATE SET visited_at = NOW()`,
      [viewerId, targetId],
    );

    await recalculateFameRating(targetId);
    await notifyUser(targetId, "visit", viewerId);

    const fameRes = await query("SELECT fame_rating FROM users WHERE id = $1", [
      targetId,
    ]);
    if (fameRes.rows.length) {
      userRow.fame_rating = fameRes.rows[0].fame_rating;
    }
  }

  const [photosRes, tagsRes, likesRes, viewerRes] = await Promise.all([
    query(
      `SELECT id, url, order_index, created_at
       FROM photos
       WHERE user_id = $1
       ORDER BY order_index`,
      [targetId],
    ),
    query(
      `SELECT t.name
       FROM user_tags ut
       JOIN tags t ON t.id = ut.tag_id
       WHERE ut.user_id = $1
       ORDER BY t.name`,
      [targetId],
    ),
    query(
      `SELECT
        EXISTS(
          SELECT 1 FROM likes WHERE liker_id = $1 AND liked_id = $2
        ) AS liked_by_me,
        EXISTS(
          SELECT 1 FROM likes WHERE liker_id = $2 AND liked_id = $1
        ) AS liked_me`,
      [viewerId, targetId],
    ),
    isSelf
      ? Promise.resolve({ rows: [] })
      : query("SELECT latitude, longitude FROM users WHERE id = $1", [
          viewerId,
        ]),
  ]);

  const likedByMe = likesRes.rows[0]?.liked_by_me ?? false;
  const likedMe = likesRes.rows[0]?.liked_me ?? false;
  const isConnected = likedByMe && likedMe;
  const distanceKm = isSelf
    ? null
    : calculateDistanceKm(viewerRes.rows[0], userRow);

  return {
    user: {
      id: userRow.id,
      username: userRow.username,
      first_name: userRow.first_name,
      last_name: userRow.last_name,
      gender: userRow.gender,
      sexual_preference: userRow.sexual_preference,
      biography: userRow.biography,
      fame_rating: userRow.fame_rating,
      location_city: userRow.location_city,
      is_online: userRow.is_online,
      last_seen: userRow.last_seen,
      profile_picture_id: userRow.profile_picture_id,
      birth_date: userRow.birth_date,
      created_at: userRow.created_at,
      distance_km: distanceKm,
      photos: photosRes.rows,
      tags: tagsRes.rows.map((row) => row.name),
      liked_by_me: likedByMe,
      liked_me: likedMe,
      is_connected: isConnected,
      is_blocked_by_me: isBlockedByMe,
    },
  };
};

export const likeUser = async (likerId, likedId) => {
  if (likerId === likedId) {
    throw new AppError("Cannot like yourself", 400);
  }

  const likerRes = await query(
    "SELECT profile_picture_id FROM users WHERE id = $1",
    [likerId],
  );

  if (!likerRes.rows.length) {
    throw new AppError("User not found", 404);
  }

  if (!likerRes.rows[0].profile_picture_id) {
    throw new AppError("You need a profile picture to like someone", 403);
  }

  await assertUserExists(likedId);

  const blockStatus = await getBlockStatus(likerId, likedId);
  if (blockStatus.isBlocked) {
    throw new AppError("User not found", 404);
  }

  const existingLike = await query(
    "SELECT 1 FROM likes WHERE liker_id = $1 AND liked_id = $2",
    [likerId, likedId],
  );

  if (existingLike.rows.length) {
    throw new AppError("Already liked", 409);
  }

  const client = await getClient();

  try {
    await client.query("BEGIN");

    await client.query(
      "INSERT INTO likes (liker_id, liked_id) VALUES ($1, $2)",
      [likerId, likedId],
    );

    await recalculateFameRating(likedId, client);
    await notifyUser(likedId, "like", likerId, client);

    const mutualRes = await client.query(
      "SELECT 1 FROM likes WHERE liker_id = $1 AND liked_id = $2",
      [likedId, likerId],
    );

    const isConnected = mutualRes.rows.length > 0;
    if (isConnected) {
      await notifyUser(likedId, "match", likerId, client);
      await notifyUser(likerId, "match", likedId, client);
    }

    await client.query("COMMIT");
    return { liked: true, connected: isConnected };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const unlikeUser = async (likerId, likedId) => {
  if (likerId === likedId) {
    throw new AppError("Cannot unlike yourself", 400);
  }

  const likeRes = await query(
    "SELECT 1 FROM likes WHERE liker_id = $1 AND liked_id = $2",
    [likerId, likedId],
  );

  if (!likeRes.rows.length) {
    throw new AppError("Not liked", 404);
  }

  await query("DELETE FROM likes WHERE liker_id = $1 AND liked_id = $2", [
    likerId,
    likedId,
  ]);

  await recalculateFameRating(likedId);
  await notifyUser(likedId, "unlike", likerId);

  return { liked: false, connected: false };
};

export const blockUser = async (blockerId, blockedId) => {
  if (blockerId === blockedId) {
    throw new AppError("Cannot block yourself", 400);
  }

  await assertUserExists(blockedId);

  const existingBlock = await query(
    "SELECT 1 FROM blocks WHERE blocker_id = $1 AND blocked_id = $2",
    [blockerId, blockedId],
  );

  if (existingBlock.rows.length) {
    throw new AppError("Already blocked", 409);
  }

  await query("INSERT INTO blocks (blocker_id, blocked_id) VALUES ($1, $2)", [
    blockerId,
    blockedId,
  ]);

  await query(
    `DELETE FROM likes
     WHERE (liker_id = $1 AND liked_id = $2)
        OR (liker_id = $2 AND liked_id = $1)`,
    [blockerId, blockedId],
  );

  await recalculateFameRating(blockedId);

  return { blocked: true };
};

export const unblockUser = async (blockerId, blockedId) => {
  const blockRes = await query(
    "SELECT 1 FROM blocks WHERE blocker_id = $1 AND blocked_id = $2",
    [blockerId, blockedId],
  );

  if (!blockRes.rows.length) {
    throw new AppError("Not blocked", 404);
  }

  await query("DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2", [
    blockerId,
    blockedId,
  ]);

  await recalculateFameRating(blockedId);

  return { blocked: false };
};

export const reportUser = async (reporterId, reportedId, reason) => {
  if (reporterId === reportedId) {
    throw new AppError("Cannot report yourself", 400);
  }

  await assertUserExists(reportedId);

  const blockStatus = await getBlockStatus(reporterId, reportedId);
  if (blockStatus.isBlocked) {
    throw new AppError("User not found", 404);
  }

  const existingReport = await query(
    "SELECT 1 FROM reports WHERE reporter_id = $1 AND reported_id = $2",
    [reporterId, reportedId],
  );

  if (existingReport.rows.length) {
    throw new AppError("Already reported", 409);
  }

  await query(
    "INSERT INTO reports (reporter_id, reported_id, reason) VALUES ($1, $2, $3)",
    [reporterId, reportedId, reason ?? null],
  );

  return { reported: true };
};

export default {
  updateProfile,
  updateTags,
  uploadPhoto,
  deletePhoto,
  setMainPhoto,
  getVisitors,
  getLikedBy,
  getPublicProfile,
  likeUser,
  unlikeUser,
  blockUser,
  unblockUser,
  reportUser,
};
