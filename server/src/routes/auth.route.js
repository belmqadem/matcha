import { Router } from "express";
import validate from "../middleware/validate.js";
import authenticate from "../middleware/authenticate.js";
import * as authController from "../controllers/auth.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resendVerificationSchema,
  resetSchema,
} from "../validators/auth.validator.js";
// import {
//   registerLimiter,
//   loginLimiter,
//   forgotPasswordLimiter,
//   resetPasswordLimiter,
//   resendVerificationLimiter,
// } from "../middleware/rateLimiter.js";

// TODO: Comment off rate limiters when testing done

const router = Router();

router.post(
  "/register",
  // registerLimiter,
  validate(registerSchema),
  asyncHandler(authController.register),
);

router.get("/verify/:token", asyncHandler(authController.verifyEmail));

router.post(
  "/login",
  // loginLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
);

router.post("/logout", authenticate, asyncHandler(authController.logout));

router.post(
  "/forgot-password",
  // forgotPasswordLimiter,
  validate(forgotSchema),
  asyncHandler(authController.forgotPassword),
);

router.post(
  "/resend-verification",
  // resendVerificationLimiter,
  validate(resendVerificationSchema),
  asyncHandler(authController.resendVerification),
);

router.post(
  "/reset-password",
  // resetPasswordLimiter,
  validate(resetSchema),
  asyncHandler(authController.resetPassword),
);

router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleCallback);
router.get("/42", authController.fortyTwoAuth);
router.get("/42/callback", authController.fortyTwoCallback);

export default router;
