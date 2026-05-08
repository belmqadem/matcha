let io = null;

export const setIo = (socketIo) => {
  io = socketIo;
};

export const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

export const emitNotification = (toUserId, type, fromUserId) => {
  emitToUser(toUserId, "notification:new", {
    type,
    from: fromUserId,
    createdAt: new Date().toISOString(),
  });
};
