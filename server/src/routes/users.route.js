import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import * as usersController from "../controllers/users.controller.js";
import { updateUserSchema } from "../validators/users.validator.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.get("/me", authenticate, asyncHandler(usersController.getMe));
router.patch(
  "/me",
  authenticate,
  validate(updateUserSchema),
  asyncHandler(usersController.updateMe),
);

export default router;
