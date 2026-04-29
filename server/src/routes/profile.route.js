import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import uploadSinglePhoto from "../middleware/upload.js";
import * as profileController from "../controllers/profile.controller.js";
import {
  updateProfileSchema,
  tagsSchema,
} from "../validators/profile.validator.js";

const router = Router();

router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  profileController.updateProfile,
);

router.post(
  "/me/tags",
  authenticate,
  validate(tagsSchema),
  profileController.updateTags,
);

router.post(
  "/me/photos",
  authenticate,
  uploadSinglePhoto,
  profileController.uploadPhoto,
);

router.delete(
  "/me/photos/:photoId",
  authenticate,
  profileController.deletePhoto,
);

router.patch(
  "/me/photos/:photoId/set-main",
  authenticate,
  profileController.setMainPhoto,
);

router.get("/me/visitors", authenticate, profileController.getVisitors);
router.get("/me/liked-by", authenticate, profileController.getLikedBy);

export default router;
