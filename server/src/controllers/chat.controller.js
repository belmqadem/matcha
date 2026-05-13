import * as chatService from "../services/chat.service.js";

export const getConversations = async (req, res) => {
  const conversations = await chatService.getConversations(req.user.id);
  return res.status(200).json({ conversations });
};

export const getUnreadCount = async (req, res) => {
  const unread = await chatService.getUnreadCount(req.user.id);
  return res.status(200).json({ unread });
};

export const getMessages = async (req, res) => {
  const { page = 1, limit = 30 } = req.validatedQuery;
  const result = await chatService.getMessages(
    req.user.id,
    req.params.userId,
    Number(page),
    Number(limit),
  );
  return res.status(200).json(result);
};

export const markAsRead = async (req, res) => {
  await chatService.markAsRead(req.user.id, req.params.userId);
  return res.status(200).json({ message: "Messages marked as read" });
};

export default { getConversations, getUnreadCount, getMessages, markAsRead };
