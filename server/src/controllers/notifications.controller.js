import * as notificationsService from "../services/notifications.service.js";

export const getNotifications = async (req, res) => {
  const result = await notificationsService.getNotifications(req.user.id);
  return res.status(200).json(result);
};

export const markAllAsRead = async (req, res) => {
  const result = await notificationsService.markAllAsRead(req.user.id);
  return res.status(200).json(result);
};

export const markOneAsRead = async (req, res) => {
  const result = await notificationsService.markOneAsRead(
    req.user.id,
    req.params.id,
  );
  return res.status(200).json(result);
};

export const deleteNotification = async (req, res) => {
  const result = await notificationsService.deleteNotification(
    req.user.id,
    req.params.id,
  );
  return res.status(200).json(result);
};

export default {
  getNotifications,
  markAllAsRead,
  markOneAsRead,
  deleteNotification,
};
