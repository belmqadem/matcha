import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as locationController from "../controllers/location.controller.js";
import {
  manualLocationSchema,
  gpsLocationSchema,
} from "../validators/location.validator.js";

const router = Router();

router.patch(
  "/me/location",
  authenticate,
  validate(manualLocationSchema),
  asyncHandler(locationController.setManual),
);

router.post(
  "/me/location/gps",
  authenticate,
  validate(gpsLocationSchema),
  asyncHandler(locationController.setFromGps),
);

router.post(
  "/me/location/ip",
  authenticate,
  asyncHandler(locationController.setFromIp),
);

export default router;
