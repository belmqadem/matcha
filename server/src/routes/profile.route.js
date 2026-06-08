import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import validateId from "../middleware/validateId.js";
import uploadSinglePhoto from "../middleware/upload.js";
import * as profileController from "../controllers/profile.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  updateProfileSchema,
  tagsSchema,
  reorderPhotosSchema,
  editPhotoSchema,
  filterPhotoSchema,
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

router.patch(
  "/me/photos/reorder",
  authenticate,
  validate(reorderPhotosSchema),
  asyncHandler(profileController.reorderPhotos),
);

router.post(
  "/me/photos/:id/edit",
  authenticate,
  validateId(),
  validate(editPhotoSchema),
  asyncHandler(profileController.editPhoto),
);

router.post(
  "/me/photos/:id/filter",
  authenticate,
  validateId(),
  validate(filterPhotoSchema),
  asyncHandler(profileController.applyFilter),
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

router.get(
  "/me/blocked",
  authenticate,
  asyncHandler(profileController.getBlocked),
);

export default router;
