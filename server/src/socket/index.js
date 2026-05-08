import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import logger from "../utils/logger.js";
import { setIo } from "./notifications.js";

const onlineUsers = new Map();
const cookieParserMiddleware = cookieParser();

const authenticateSocket = (socket, next) => {
  const token =
    socket.handshake.auth?.token || socket.request?.cookies?.token || null;
  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
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
      origin: env.CORS_ORIGIN,
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
