import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import * as usersController from "../controllers/users.controller.js";
import { updateUserSchema } from "../validators/users.validator.js";

const router = Router();

router.get("/me", authenticate, usersController.getMe);
router.patch(
  "/me",
  authenticate,
  validate(updateUserSchema),
  usersController.updateMe,
);

export default router;
