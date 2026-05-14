import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import validateQuery from "../middleware/validateQuery.js";
import validateUUID from "../middleware/validateUUID.js";
import asyncHandler from "../utils/asyncHandler.js";
import * as chatController from "../controllers/chat.controller.js";
import { messagesQuerySchema } from "../validators/chat.validator.js";

const router = Router();

router.get(
  "/unread/count",
  authenticate,
  asyncHandler(chatController.getUnreadCount),
);

router.get(
  "/conversations",
  authenticate,
  asyncHandler(chatController.getConversations),
);

router.get(
  "/:userId",
  authenticate,
  validateUUID("userId"),
  validateQuery(messagesQuerySchema),
  asyncHandler(chatController.getMessages),
);

router.post(
  "/:userId/read",
  authenticate,
  validateUUID("userId"),
  asyncHandler(chatController.markAsRead),
);

export default router;
