import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import { setIo, emitNotification } from "./notifications.js";
import { sendMessage } from "../services/chat.service.js";

const onlineUsers = new Map();
const cookieParserMiddleware = cookieParser();
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const authenticateSocket = (socket, next) => {
  const token =
    socket.handshake.auth?.token || socket.request?.cookies?.token || null;
  if (!token || typeof token !== "string") {
    return next(new Error("Authentication required"));
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return next(new Error("Authentication failed"));
    }
    const decoded = jwt.verify(token, env.JWT_SECRET);
    socket.userId = decoded.id;
    return next();
  } catch (err) {
    logger.warn({ err }, "Socket authentication failed");
    return next(new Error("Authentication failed"));
  }
};

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:
        env.NODE_ENV === "development"
          ? ["http://localhost:5173", "http://localhost:3000", true]
          : env.CORS_ORIGIN,
      credentials: true,
    },
  });

  setIo(io);
  io.use((socket, next) => cookieParserMiddleware(socket.request, {}, next));
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.userId;
    if (userId) {
      socket.join(`user:${userId}`);
      const sockets = onlineUsers.get(userId) || new Set();
      sockets.add(socket.id);
      onlineUsers.set(userId, sockets);
    }

    socket.on("chat:send", async ({ to, content }) => {
      try {
        if (!to || typeof content !== "string" || !content.trim()) {
          socket.emit("chat:error", { message: "Invalid message" });
          return;
        }

        if (!UUID_REGEX.test(to)) {
          socket.emit("chat:error", { message: "Invalid user ID" });
          return;
        }

        const message = await sendMessage(userId, to, content.trim());

        io.to(`user:${to}`).emit("chat:receive", {
          id: message.id,
          from: userId,
          content: message.content,
          sentAt: message.sent_at,
          isRead: false,
        });

        socket.emit("chat:sent", {
          id: message.id,
          to,
          content: message.content,
          sentAt: message.sent_at,
        });

        emitNotification(to, "message", userId);
      } catch (err) {
        socket.emit("chat:error", {
          message: err.isOperational ? err.message : "Failed to send message",
        });
        if (!err.isOperational) {
          logger.error({ err }, "Unexpected error in chat:send handler");
        }
      }
    });

    socket.on("disconnect", () => {
      if (!userId) return;

      const sockets = onlineUsers.get(userId);
      if (!sockets) return;

      sockets.delete(socket.id);
      if (sockets.size === 0) {
        onlineUsers.delete(userId);
      }
    });
  });

  return io;
};

export const getOnlineUsers = () => new Map(onlineUsers);
