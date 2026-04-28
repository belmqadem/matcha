import { Router } from "express";
import validate from "../middleware/validate.js";
import authenticate from "../middleware/authenticate.js";
import * as authController from "../controllers/auth.controller.js";
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.get("/verify/:token", authController.verifyEmail);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authenticate, authController.logout);
router.post(
  "/forgot-password",
  validate(forgotSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetSchema),
  authController.resetPassword,
);

// OAuth (placeholders)
router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleCallback);

export default router;
