import { query } from "../db/pool.js";
import AppError from "../utils/AppError.js";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/email.js";

const buildUserResponse = async (userId) => {
  const userRes = await query(
    `SELECT id, username, email, first_name, last_name,
            gender, sexual_preference, biography, fame_rating,
            latitude, longitude, location_city,
            is_verified, is_online, last_seen, profile_picture_id,
            created_at, updated_at
     FROM users WHERE id = $1`,
    [userId],
  );

  if (!userRes.rows.length) {
    throw new AppError("User not found", 404);
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
    return new AppError("Username already taken", 409);
  }

  if (detail.includes("(email)") || constraint.includes("email")) {
    return new AppError("Email already in use", 409);
  }

  return new AppError("User already exists", 409);
};

export const getMe = async (userId) => buildUserResponse(userId);

export const updateMe = async (userId, updates) => {
  const currentRes = await query("SELECT email FROM users WHERE id = $1", [
    userId,
  ]);

  if (!currentRes.rows.length) {
    throw new AppError("User not found", 404);
  }

  const currentEmail = currentRes.rows[0].email;
  const emailChanged =
    typeof updates.email === "string" && updates.email !== currentEmail;

  const setClauses = [];
  const values = [];

  const setField = (key, value) => {
    values.push(value);
    setClauses.push(`${key} = $${values.length}`);
  };

  if (updates.first_name !== undefined) {
    setField("first_name", updates.first_name);
  }
  if (updates.last_name !== undefined) {
    setField("last_name", updates.last_name);
  }
  if (updates.email !== undefined) {
    setField("email", updates.email);
  }
  if (updates.username !== undefined) {
    setField("username", updates.username);
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
    await sendVerificationEmail(updates.email, token);
  }

  return buildUserResponse(userId);
};
