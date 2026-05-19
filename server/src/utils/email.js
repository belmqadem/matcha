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
        // background: #f7f7fb;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        color: #1f2937;
      }
      .container {
        width: 100%;
        max-width: 560px;
        // margin: 0 auto;
        padding-top: 24px;
				padding-left: 12px;
				padding-right: 12px;
      }
      .card {
        // background: #ffffff;
        // border: 1px solid #e5e7eb;
        // border-radius: 16px;
        // padding: 24px;
      }
      h2 {
        margin: 0 0 12px;
        font-size: 22px;
      }
      p {
        margin: 0 0 14px;
        color: #4b5563;
        line-height: 1.5;
      }
      .button {
        display: inline-block;
        background: #e94057;
        color: #ffffff;
        text-decoration: none;
        padding: 12px 20px;
        border-radius: 999px;
        font-weight: 600;
      }
      .footer {
        margin-top: 18px;
        font-size: 12px;
        color: #6b7280;
      }
      .footer a {
        color: #e94057;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <h2>${heading}</h2>
        <p>${message}</p>
        <p>
          <a href="${actionUrl}" class="button">${actionText}</a>
        </p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <div class="footer">
          <p>Thanks,</p>
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
