import * as authService from "../services/auth.service.js";
import { setLocationFromIp } from "../services/location.service.js";
import logger from "../utils/logger.js";
import { issueAuthCookie } from "../utils/issueAuthCookie.js";
import passport from "../config/passport.js";
import env from "../config/env.js";

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
  const { user, hasLocation } = await authService.login({
    username,
    password,
  });

  issueAuthCookie(res, user);

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
  res.clearCookie("token");
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

const oauthFailureRedirect = `${env.CLIENT_URL}/login?error=oauth_failed`;

const oauthSuccessRedirect = (req, res) => {
  issueAuthCookie(res, req.user);
  res.redirect(`${env.CLIENT_URL}/browse`);
};

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

export const googleCallback = [
  passport.authenticate("google", {
    session: false,
    failureRedirect: oauthFailureRedirect,
  }),
  oauthSuccessRedirect,
];

export const fortyTwoAuth = passport.authenticate("42", { session: false });

export const fortyTwoCallback = [
  passport.authenticate("42", {
    session: false,
    failureRedirect: oauthFailureRedirect,
  }),
  oauthSuccessRedirect,
];

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
  fortyTwoAuth,
  fortyTwoCallback,
};
