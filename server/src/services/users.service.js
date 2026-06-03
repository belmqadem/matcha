import { query } from "../db/pool.js";
import AppError from "../utils/AppError.js";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/email.js";
import { sanitizeObject } from "../utils/sanitize.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { get as redisGet, set as redisSet } from "../db/redis.js";
import { CacheKeys } from "../utils/cacheKeys.js";
import {
  invalidateProfileCache,
  invalidateUserCaches,
} from "../utils/invalidateCache.js";

const buildUserResponse = async (userId) => {
  const userRes = await query(
    `SELECT id, username, email, first_name, last_name,
            gender, sexual_preference, biography, fame_rating, birth_date,
            latitude, longitude, location_city,
            is_verified, is_online, last_seen, profile_picture_id,
            oauth_provider, oauth_id,
            created_at, updated_at
     FROM users WHERE id = $1`,
    [userId],
  );

  if (!userRes.rows.length) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  const tagsRes = await query(
    `SELECT t.name
     FROM user_tags ut
     JOIN tags t ON t.id = ut.tag_id
     WHERE ut.user_id = $1
     ORDER BY t.name`,
    [userId],
  );

  const photosRes = await query(
    `SELECT id, url, order_index, created_at
     FROM photos
     WHERE user_id = $1
     ORDER BY order_index`,
    [userId],
  );

  return {
    ...userRes.rows[0],
    is_oauth_user: Boolean(
      userRes.rows[0].oauth_provider && userRes.rows[0].oauth_id,
    ),
    tags: tagsRes.rows.map((row) => row.name),
    photos: photosRes.rows,
  };
};

const mapUniqueConstraintError = (err) => {
  if (!err || err.code !== "23505") {
    return null;
  }

  const detail = err.detail || "";
  const constraint = err.constraint || "";

  if (detail.includes("(username)") || constraint.includes("username")) {
    return new AppError("Username already taken", HTTP_STATUS.CONFLICT);
  }

  if (detail.includes("(email)") || constraint.includes("email")) {
    return new AppError("Email already in use", HTTP_STATUS.CONFLICT);
  }

  return new AppError("User already exists", HTTP_STATUS.CONFLICT);
};

export const getMe = async (userId) => {
  const cacheKey = CacheKeys.myProfile(userId);
  const cached = await redisGet(cacheKey);
  if (cached) {
    return cached;
  }

  const result = await buildUserResponse(userId);
  await redisSet(cacheKey, result, 60);
  return result;
};

export const updateMe = async (userId, updates) => {
  const sanitizedUpdates = sanitizeObject(updates);
  const currentRes = await query("SELECT email FROM users WHERE id = $1", [
    userId,
  ]);

  if (!currentRes.rows.length) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  const currentEmail = currentRes.rows[0].email;
  const emailChanged =
    typeof sanitizedUpdates.email === "string" &&
    sanitizedUpdates.email !== currentEmail;

  const setClauses = [];
  const values = [];

  const setField = (key, value) => {
    values.push(value);
    setClauses.push(`${key} = $${values.length}`);
  };

  if (sanitizedUpdates.first_name !== undefined) {
    setField("first_name", sanitizedUpdates.first_name);
  }
  if (sanitizedUpdates.last_name !== undefined) {
    setField("last_name", sanitizedUpdates.last_name);
  }
  if (sanitizedUpdates.email !== undefined) {
    setField("email", sanitizedUpdates.email);
  }
  if (sanitizedUpdates.username !== undefined) {
    setField("username", sanitizedUpdates.username);
  }

  if (emailChanged) {
    setField("is_verified", false);
  }

  if (setClauses.length > 0) {
    values.push(userId);
    const sql = `UPDATE users SET ${setClauses.join(", ")}, updated_at = NOW() WHERE id = $${values.length}`;

    try {
      await query(sql, values);
    } catch (err) {
      const mapped = mapUniqueConstraintError(err);
      if (mapped) {
        throw mapped;
      }
      throw err;
    }
  }

  if (emailChanged) {
    const token = crypto.randomBytes(32).toString("hex");
    await query(
      `INSERT INTO email_tokens (user_id, token, type, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')`,
      [userId, token, "verification"],
    );
    await sendVerificationEmail(sanitizedUpdates.email, token);
  }

  await invalidateUserCaches(userId);
  await invalidateProfileCache(userId);

  return buildUserResponse(userId);
};
