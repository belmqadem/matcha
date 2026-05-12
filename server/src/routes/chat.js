import { Router } from "express";
import { z } from "zod";
import authenticate from "../middleware/authenticate.js";
import validateQuery from "../middleware/validateQuery.js";
import validateUUID from "../middleware/validateUUID.js";
import asyncHandler from "../utils/asyncHandler.js";
import { query } from "../db/pool.js";
import * as chatController from "../controllers/chat.controller.js";

const messagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});

const router = Router();

router.get(
  "/unread/count",
  authenticate,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS count FROM messages
       WHERE receiver_id = $1 AND is_read = false`,
      [req.user.id],
    );
    return res.status(200).json({ unread: rows[0]?.count ?? 0 });
  }),
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
