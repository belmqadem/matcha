import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import asyncHandler from "../utils/asyncHandler.js";
import validateQuery from "../middleware/validateQuery.js";
import { searchQuerySchema } from "../validators/search.validator.js";
import * as searchController from "../controllers/search.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  validateQuery(searchQuerySchema),
  asyncHandler(searchController.search),
);

export default router;
