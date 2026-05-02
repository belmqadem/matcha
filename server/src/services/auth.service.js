import { query } from "../db/pool.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/email.js";
import { isCommonPassword } from "../utils/commonPasswords.js";
import env from "../config/env.js";

const SALT_ROUNDS = 12;

export const register = async ({
  username,
  email,
  password,
  first_name,
  last_name,
}) => {
  const uRes = await query("SELECT id FROM users WHERE username = $1", [
    username,
  ]);
  if (uRes.rows.length) {
    throw new AppError("Username already taken", 409);
  }

  const eRes = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (eRes.rows.length) {
    throw new AppError("Email already in use", 409);
  }

  if (isCommonPassword(password)) {
    throw new AppError("Password is too common", 400);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const insertRes = await query(
    `INSERT INTO users (username, email, password_hash, first_name, last_name)
		 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [username, email, passwordHash, first_name, last_name],
  );

  const userId = insertRes.rows[0].id;

  const token = crypto.randomBytes(32).toString("hex");
  await query(
    `INSERT INTO email_tokens (user_id, token, type, expires_at)
		 VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')`,
    [userId, token, "verification"],
  );

  await sendVerificationEmail(email, token);

  return { id: userId };
};

export const verifyEmail = async (token) => {
  const tRes = await query(
    "SELECT id, user_id, expires_at FROM email_tokens WHERE token = $1 AND type = $2",
    [token, "verification"],
  );
  if (!tRes.rows.length) {
    throw new AppError("Invalid or expired token", 400);
  }

  const row = tRes.rows[0];
  const expiresAt = new Date(row.expires_at);
  if (expiresAt < new Date()) {
    await query("DELETE FROM email_tokens WHERE id = $1", [row.id]);
    throw new AppError("Token expired", 400);
  }

  await query("UPDATE users SET is_verified = true WHERE id = $1", [
    row.user_id,
  ]);
  await query("DELETE FROM email_tokens WHERE id = $1", [row.id]);
  return true;
};

export const login = async ({ username, password }) => {
  const uRes = await query(
    "SELECT id, username, email, password_hash, is_verified, first_name, last_name, profile_picture_id FROM users WHERE username = $1",
    [username],
  );

  if (!uRes.rows.length) {
    throw new AppError("Invalid credentials", 401);
  }

  const user = uRes.rows[0];

  const match = await bcrypt.compare(password, user.password_hash || "");
  if (!match) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.is_verified) {
    throw new AppError("Please verify your email first.", 401);
  }

  await query(
    "UPDATE users SET is_online = true, last_seen = NOW() WHERE id = $1",
    [user.id],
  );

  const payload = { id: user.id, username: user.username, email: user.email };
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });

  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    profile_picture_id: user.profile_picture_id,
  };

  return { user: safeUser, token };
};

export const logout = async (userId) => {
  await query(
    "UPDATE users SET is_online = false, last_seen = NOW() WHERE id = $1",
    [userId],
  );
  return true;
};

export const forgotPassword = async (email) => {
  const uRes = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (!uRes.rows.length) {
    return true;
  }

  const userId = uRes.rows[0].id;

  // delete existing reset tokens
  await query("DELETE FROM email_tokens WHERE user_id = $1 AND type = $2", [
    userId,
    "reset",
  ]);

  const token = crypto.randomBytes(32).toString("hex");
  await query(
    `INSERT INTO email_tokens (user_id, token, type, expires_at)
		 VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`,
    [userId, token, "reset"],
  );

  await sendPasswordResetEmail(email, token);
  return true;
};

export const resetPassword = async (token, newPassword) => {
  const tRes = await query(
    "SELECT id, user_id, expires_at FROM email_tokens WHERE token = $1 AND type = $2",
    [token, "reset"],
  );
  if (!tRes.rows.length) {
    throw new AppError("Invalid or expired token", 400);
  }

  const row = tRes.rows[0];
  const expiresAt = new Date(row.expires_at);
  if (expiresAt < new Date()) {
    await query("DELETE FROM email_tokens WHERE id = $1", [row.id]);
    throw new AppError("Token expired", 400);
  }

  if (isCommonPassword(newPassword)) {
    throw new AppError("Password is too common", 400);
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
  resetPassword,
};
