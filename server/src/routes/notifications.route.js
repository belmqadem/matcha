import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import validateId from "../middleware/validateId.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as notificationsController from "../controllers/notifications.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  asyncHandler(notificationsController.getNotifications),
);

router.patch(
  "/read-all",
  authenticate,
  asyncHandler(notificationsController.markAllAsRead),
);

router.patch(
  "/:id/read",
  authenticate,
  validateId(),
  asyncHandler(notificationsController.markOneAsRead),
);

router.delete(
  "/:id",
  authenticate,
  validateId(),
  asyncHandler(notificationsController.deleteNotification),
);

export default router;
