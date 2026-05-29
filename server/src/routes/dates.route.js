import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import validateId from "../middleware/validateId.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  proposeDateSchema,
  updateDateSchema,
} from "../validators/dates.validator.js";
import * as datesController from "../controllers/dates.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(proposeDateSchema),
  asyncHandler(datesController.proposeDate),
);

router.get("/", authenticate, asyncHandler(datesController.getDates));

router.get(
  "/:id",
  authenticate,
  validateId("id", "date"),
  asyncHandler(datesController.getDate),
);

router.patch(
  "/:id",
  authenticate,
  validateId("id", "date"),
  validate(updateDateSchema),
  asyncHandler(datesController.updateDate),
);

router.delete(
  "/:id",
  authenticate,
  validateId("id", "date"),
  asyncHandler(datesController.cancelDate),
);

export default router;
