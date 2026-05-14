import * as authService from "../services/auth.service.js";
import { setLocationFromIp } from "../services/location.service.js";
import logger from "../utils/logger.js";
import env from "../config/env.js";
import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req, res) => {
  await authService.register(req.body);
  return res
    .status(201)
    .json({ message: "Verification email sent. Please check your inbox." });
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  await authService.verifyEmail(token);
  return res.status(200).json({ message: "Email verified successfully." });
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const { user, token, hasLocation } = await authService.login({
    username,
    password,
  });

  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

  if (!hasLocation) {
    setLocationFromIp(user.id, req.ip).catch((err) =>
      logger.warn(
        { err, userId: user.id },
        "Could not auto-set location on login",
      ),
    );
  }

  return res.status(200).json({ user });
};

export const logout = async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie(COOKIE_NAME);
  return res.status(200).json({ message: "Logged out." });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  return res
    .status(200)
    .json({ message: "If that email exists, a reset link has been sent." });
};

export const resendVerification = async (req, res) => {
  const { email } = req.body;
  await authService.resendVerification(email);
  return res.status(200).json({
    message: "If that email exists, a verification link has been sent.",
  });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  return res.status(200).json({ message: "Password updated successfully." });
};

// OAuth placeholders
export const googleAuth = async (_req, _res) => {
  throw new AppError("Not implemented", HTTP_STATUS.NOT_IMPLEMENTED);
};

export const googleCallback = async (_req, _res) => {
  throw new AppError("Not implemented", HTTP_STATUS.NOT_IMPLEMENTED);
};

export default {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resendVerification,
  resetPassword,
  googleAuth,
  googleCallback,
};
