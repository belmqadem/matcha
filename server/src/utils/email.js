import nodemailer from "nodemailer";
import logger from "./logger.js";
import env from "../config/env.js";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  EMAIL_FROM,
  CORS_ORIGIN,
} = env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth:
    SMTP_USER && SMTP_PASSWORD
      ? { user: SMTP_USER, pass: SMTP_PASSWORD }
      : undefined,
});

const logEmailFallback = (url) => {
  if (process.env.NODE_ENV !== "production") {
    logger.info({ url }, "Email content (development mode)");
  }
};

export async function sendVerificationEmail(to, token) {
  const url = `${CORS_ORIGIN}/verify-email/${token}`;

  const mail = {
    from: EMAIL_FROM,
    to,
    subject: "Verify your email",
    text: `Please verify your email by visiting: ${url}`,
    html: `<p>Please verify your email by clicking <a href="${url}">this link</a></p>`,
  };

  try {
    if (transporter) {
      const info = await transporter.sendMail(mail);
      logger.info(
        { messageId: info && info.messageId },
        "Sent verification email",
      );
    }
  } catch (err) {
    logger.error({ err }, "Failed to send verification email");
    throw err;
  }

  logEmailFallback(url);
  return url;
}

export async function sendPasswordResetEmail(to, token) {
  const url = `${CORS_ORIGIN}/reset-password/${token}`;

  const mail = {
    from: EMAIL_FROM,
    to,
    subject: "Reset your password",
    text: `Reset your password by visiting: ${url}`,
    html: `<p>Reset your password by clicking <a href="${url}">this link</a></p>`,
  };

  try {
    if (transporter) {
      const info = await transporter.sendMail(mail);
      logger.info(
        { messageId: info && info.messageId },
        "Sent password reset email",
      );
    }
  } catch (err) {
    logger.error({ err }, "Failed to send password reset email");
    throw err;
  }

  logEmailFallback(url);
  return url;
}
