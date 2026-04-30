import nodemailer from "nodemailer";
import logger from "./logger.js";
import env from "../config/env.js";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  EMAIL_FROM,
  CLIENT_URL,
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
  if (env.NODE_ENV !== "production") {
    logger.info({ url }, "Email content (development mode)");
  }
};

const createEmailHtml = ({ heading, message, actionText, actionUrl }) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        margin: 0;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #1A1A2E;
      }
      .container {
        width: 100%;
        max-width: 640px;
        margin: 0 auto;
        padding: 18px;
      }
      .card {
        background: #ffffff;
        border-radius: 24px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }
      .header {
        background: #e94057;
        padding: 24px;
        text-align: center;
        color: #ffffff;
      }
      .header h1 {
        margin: 0;
        font-size: 26px;
        letter-spacing: -0.04em;
      }
      .body {
        padding: 24px;
      }
      .body p {
        margin: 0 0 10px;
        color: #3f3f46;
      }
      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: #e94057;
        color: #ffffff;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 999px;
        font-weight: 600;
      }
      .footer {
        padding: 0 24px 32px;
        color: #6b7280;
        font-size: 12px;
      }
      .footer a {
        color: #e94057;
        text-decoration: none;
      }
      .code {
        display: block;
        margin: 18px 0;
        padding: 16px;
        background: #f5f5f7;
        border-radius: 12px;
        font-family: monospace;
        color: #111827;
        word-break: break-all;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          <h1>Matcha</h1>
        </div>
        <div class="body">
          <h2>${heading}</h2>
          <p>${message}</p>
          <p style="margin: 32px 0;">
            <a href="${actionUrl}" class="button">${actionText}</a>
          </p>
          <p>Thanks for being part of Matcha — we&apos;re excited to help you find a real connection.</p>
        </div>
        <div class="footer">
          <p>Love,</p>
          <p>The Matcha Team</p>
          <p><a href="${CLIENT_URL}">matcha.1337.dev</a></p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

export async function sendVerificationEmail(to, token) {
  const url = `${CLIENT_URL}/verify-email/${token}`;

  const mail = {
    from: EMAIL_FROM,
    to,
    subject: "Verify your email",
    text: `Please verify your email by visiting: ${url}`,
    html: createEmailHtml({
      heading: "Verify your email",
      message:
        "A quick step to make your Matcha account official and keep your matches secure.",
      actionText: "Verify email",
      actionUrl: url,
    }),
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
  const url = `${CLIENT_URL}/reset-password/${token}`;

  const mail = {
    from: EMAIL_FROM,
    to,
    subject: "Reset your password",
    text: `Reset your password by visiting: ${url}`,
    html: createEmailHtml({
      heading: "Reset your password",
      message:
        "No worries — use the button below to create a new password and get back to your conversations.",
      actionText: "Reset password",
      actionUrl: url,
    }),
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
