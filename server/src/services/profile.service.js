import { query, getClient } from "../db/pool.js";
import AppError from "../utils/AppError.js";
import { recalculateFameRating } from "../utils/fameRating.js";
import { getMe } from "./users.service.js";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { fileURLToPath } from "url";

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

export default {
  updateProfile,
  updateTags,
  uploadPhoto,
  deletePhoto,
  setMainPhoto,
  getVisitors,
  getLikedBy,
};
