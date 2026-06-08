import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import asyncHandler from "../utils/asyncHandler.js";
import validateQuery from "../middleware/validateQuery.js";
import {
  browseQuerySchema,
  mapQuerySchema,
} from "../validators/browse.validator.js";
import * as browseController from "../controllers/browse.controller.js";

const router = Router();

router.get(
  "/map",
  authenticate,
  validateQuery(mapQuerySchema),
  asyncHandler(browseController.getMapUsers),
);

router.get(
  "/",
  authenticate,
  validateQuery(browseQuerySchema),
  asyncHandler(browseController.getSuggested),
);

export default router;
