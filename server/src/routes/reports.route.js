import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import validateUUID from "../middleware/validateUUID.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as profileController from "../controllers/profile.controller.js";
import validate from "../middleware/validate.js";
import { reportSchema } from "../validators/reports.validator.js";

const router = Router();

router.post(
  "/:id",
  authenticate,
  validateUUID(),
  validate(reportSchema),
  asyncHandler(profileController.reportUser),
);

export default router;
