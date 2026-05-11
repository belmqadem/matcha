import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import validateUUID from "../middleware/validateUUID.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as profileController from "../controllers/profile.controller.js";

const router = Router();

router.post(
  "/:id",
  authenticate,
  validateUUID,
  asyncHandler(profileController.blockUser),
);
router.delete(
  "/:id",
  authenticate,
  validateUUID,
  asyncHandler(profileController.unblockUser),
);

export default router;
