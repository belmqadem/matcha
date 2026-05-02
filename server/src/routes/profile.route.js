import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import uploadSinglePhoto from "../middleware/upload.js";
import * as profileController from "../controllers/profile.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  updateProfileSchema,
  tagsSchema,
} from "../validators/profile.validator.js";

const router = Router();

router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(profileController.updateProfile),
);

router.post(
  "/me/tags",
  authenticate,
  validate(tagsSchema),
  asyncHandler(profileController.updateTags),
);

router.post(
  "/me/photos",
  authenticate,
  uploadSinglePhoto,
  asyncHandler(profileController.uploadPhoto),
);

router.delete(
  "/me/photos/:photoId",
  authenticate,
  asyncHandler(profileController.deletePhoto),
);

router.patch(
  "/me/photos/:photoId/set-main",
  authenticate,
  asyncHandler(profileController.setMainPhoto),
);

router.get(
  "/me/visitors",
  authenticate,
  asyncHandler(profileController.getVisitors),
);
router.get(
  "/me/liked-by",
  authenticate,
  asyncHandler(profileController.getLikedBy),
);

export default router;
