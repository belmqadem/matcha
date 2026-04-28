import AppError from "../utils/AppError.js";
import * as authService from "../services/auth.service.js";

const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req, res, next) => {
  try {
    await authService.register(req.body);
    return res
      .status(201)
      .json({ message: "Verification email sent. Please check your inbox." });
  } catch (err) {
    return next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    await authService.verifyEmail(token);
    return res.status(200).json({ message: "Email verified successfully." });
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const { user, token } = await authService.login({ username, password });

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      throw new AppError("Authentication required", 401);
    }

    await authService.logout(req.user.id);
    res.clearCookie(COOKIE_NAME);
    return res.status(200).json({ message: "Logged out." });
  } catch (err) {
    return next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    return res
      .status(200)
      .json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    return next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    return res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    return next(err);
  }
};

// OAuth placeholders
export const googleAuth = (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

export const googleCallback = (req, res) => {
  res.status(501).json({ error: "Not implemented" });
};

export default {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
};
