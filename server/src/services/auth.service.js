import { query } from "../db/pool.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import AppError from "../utils/AppError.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/email.js";
import { isCommonPassword } from "../utils/commonPasswords.js";
import { sanitizeObject } from "../utils/sanitize.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { set as redisSet } from "../db/redis.js";
import { CacheKeys } from "../utils/cacheKeys.js";
import { invalidateUserCaches } from "../utils/invalidateCache.js";

const SALT_ROUNDS = 12;

export const register = async ({
  username,
  email,
  password,
  first_name,
  last_name,
}) => {
  const sanitized = sanitizeObject({ username, email, first_name, last_name });
  const safeUsername = sanitized.username;
  const safeEmail = sanitized.email;
  const safeFirstName = sanitized.first_name;
  const safeLastName = sanitized.last_name;

  const uRes = await query("SELECT id FROM users WHERE username = $1", [
    safeUsername,
  ]);
  if (uRes.rows.length) {
    throw new AppError(
      "Username already taken. Please choose another.",
      HTTP_STATUS.CONFLICT,
    );
  }

  const eRes = await query("SELECT id FROM users WHERE email = $1", [
    safeEmail,
  ]);
  if (eRes.rows.length) {
    throw new AppError(
      "Email already in use. Please choose another.",
      HTTP_STATUS.CONFLICT,
    );
  }

  if (isCommonPassword(password)) {
    throw new AppError(
      "Password is too common. Please choose another.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const insertRes = await query(
    `INSERT INTO users (username, email, password_hash, first_name, last_name)
		 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [safeUsername, safeEmail, passwordHash, safeFirstName, safeLastName],
  );

  const userId = insertRes.rows[0].id;

  const token = crypto.randomBytes(32).toString("hex");
  const tokenType = "verification";
  await query(
    `INSERT INTO email_tokens (user_id, token, type, expires_at)
		 VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')`,
    [userId, token, tokenType],
  );

  await sendVerificationEmail(safeEmail, token);

  return { id: userId };
};

export const verifyEmail = async (token) => {
  const tRes = await query(
    "SELECT id, user_id, expires_at FROM email_tokens WHERE token = $1 AND type = $2",
    [token, "verification"],
  );
  if (!tRes.rows.length) {
    throw new AppError("Invalid or expired token", HTTP_STATUS.BAD_REQUEST);
  }

  const row = tRes.rows[0];
  const expiresAt = new Date(row.expires_at);
  if (expiresAt < new Date()) {
    await query("DELETE FROM email_tokens WHERE id = $1", [row.id]);
    throw new AppError("Token expired", HTTP_STATUS.BAD_REQUEST);
  }

  await query("UPDATE users SET is_verified = true WHERE id = $1", [
    row.user_id,
  ]);
  await query("DELETE FROM email_tokens WHERE id = $1", [row.id]);
  return true;
};

export const login = async ({ username, password }) => {
  const uRes = await query(
    `SELECT
      id,
      username,
      email,
      password_hash,
      is_verified,
      first_name,
      last_name,
      profile_picture_id,
      latitude,
      longitude,
      gender,
      sexual_preference,
      biography,
      EXISTS (SELECT 1 FROM user_tags WHERE user_id = users.id) AS has_tags,
      EXISTS (SELECT 1 FROM photos WHERE user_id = users.id) AS has_photos,
      CASE
        WHEN gender IS NOT NULL
          AND sexual_preference IS NOT NULL
          AND biography IS NOT NULL
          AND biography != ''
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND EXISTS (SELECT 1 FROM user_tags WHERE user_id = users.id)
          AND EXISTS (SELECT 1 FROM photos WHERE user_id = users.id)
        THEN true
        ELSE false
      END AS is_profile_complete
     FROM users
     WHERE username = $1`,
    [username],
  );

  if (!uRes.rows.length) {
    throw new AppError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
  }

  const user = uRes.rows[0];

  if (!user.password_hash) {
    throw new AppError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new AppError("Invalid credentials", HTTP_STATUS.UNAUTHORIZED);
  }

  if (!user.is_verified) {
    throw new AppError(
      "Please verify your email first.",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  await query(
    "UPDATE users SET is_online = true, last_seen = NOW() WHERE id = $1",
    [user.id],
  );

  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    profile_picture_id: user.profile_picture_id,
  };

  const hasLocation = user.latitude !== null && user.longitude !== null;
  const isProfileComplete = Boolean(user.is_profile_complete);
  const missingFields = [];

  if (!user.gender) missingFields.push("gender");
  if (!user.sexual_preference) missingFields.push("sexual_preference");
  if (!user.biography || String(user.biography).trim() === "") {
    missingFields.push("biography");
  }
  if (!hasLocation) missingFields.push("location");
  if (!user.has_tags) missingFields.push("tags");
  if (!user.has_photos) missingFields.push("photo");

  return { user: safeUser, hasLocation, isProfileComplete, missingFields };
};

export const logout = async (userId, jti, exp) => {
  await query(
    "UPDATE users SET is_online = false, last_seen = NOW() WHERE id = $1",
    [userId],
  );

  if (jti && exp) {
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redisSet(CacheKeys.blocklist(jti), "1", ttl);
    }
  }

  await invalidateUserCaches(userId);
  return true;
};

export const forgotPassword = async (email) => {
  const uRes = await query(
    "SELECT id, oauth_provider FROM users WHERE email = $1",
    [email],
  );
  if (!uRes.rows.length) {
    return true;
  }

  const user = uRes.rows[0];
  if (user.oauth_provider) {
    return true;
  }

  const userId = user.id;

  // delete existing reset tokens
  await query("DELETE FROM email_tokens WHERE user_id = $1 AND type = $2", [
    userId,
    "reset",
  ]);

  const token = crypto.randomBytes(32).toString("hex");
  const tokenType = "reset";
  await query(
    `INSERT INTO email_tokens (user_id, token, type, expires_at)
		 VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`,
    [userId, token, tokenType],
  );

  await sendPasswordResetEmail(email, token);
  return true;
};

export const resendVerification = async (email) => {
  const uRes = await query(
    "SELECT id, is_verified, oauth_provider FROM users WHERE email = $1",
    [email],
  );

  if (!uRes.rows.length) {
    return true;
  }

  const user = uRes.rows[0];
  if (user.oauth_provider) {
    return true;
  }
  if (user.is_verified) {
    return true;
  }

  await query("DELETE FROM email_tokens WHERE user_id = $1 AND type = $2", [
    user.id,
    "verification",
  ]);

  const token = crypto.randomBytes(32).toString("hex");
  const tokenType = "verification";
  await query(
    `INSERT INTO email_tokens (user_id, token, type, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')`,
    [user.id, token, tokenType],
  );

  await sendVerificationEmail(email, token);
  return true;
};

export const resetPassword = async (token, newPassword) => {
  const tRes = await query(
    "SELECT id, user_id, expires_at FROM email_tokens WHERE token = $1 AND type = $2",
    [token, "reset"],
  );
  if (!tRes.rows.length) {
    throw new AppError("Invalid or expired token", HTTP_STATUS.BAD_REQUEST);
  }

  const row = tRes.rows[0];
  const expiresAt = new Date(row.expires_at);
  if (expiresAt < new Date()) {
    await query("DELETE FROM email_tokens WHERE id = $1", [row.id]);
    throw new AppError("Token expired", HTTP_STATUS.BAD_REQUEST);
  }

  if (isCommonPassword(newPassword)) {
    throw new AppError("Password is too common", HTTP_STATUS.BAD_REQUEST);
  }

  const currentRes = await query(
    "SELECT password_hash FROM users WHERE id = $1",
    [row.user_id],
  );

  if (currentRes.rows.length) {
    const currentHash = currentRes.rows[0].password_hash;
    const isSame = await bcrypt.compare(newPassword, currentHash || "");
    if (isSame) {
      throw new AppError(
        "New password must be different from the current password",
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
    passwordHash,
    row.user_id,
  ]);

  // delete all reset tokens for this user
  await query("DELETE FROM email_tokens WHERE user_id = $1 AND type = $2", [
    row.user_id,
    "reset",
  ]);

  return true;
};

export default {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resendVerification,
  resetPassword,
};
