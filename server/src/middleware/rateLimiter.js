import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import jwt from "jsonwebtoken";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import AppError from "../utils/AppError.js";
import env from "../config/env.js";

const DEFAULT_MESSAGE = "Too many requests, please try again later.";
const isDev = env.NODE_ENV === "development";

const keyGenerator = (req) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.id) return `user:${decoded.id}`;
    }
  } catch {
    // fall through
  }
  return ipKeyGenerator(req.ip);
};

const createRateLimiter = (options = {}) => {
  const message = options.message || DEFAULT_MESSAGE;
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    // dev: 2000/15 min (relaxed for active testing), prod: 500/15 min
    limit: options.limit || (isDev ? 2000 : 500),
    keyGenerator: options.keyGenerator ?? keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    message,
    handler: (_req, _res, next, opts) => {
      const safeMessage =
        typeof opts?.message === "string" ? opts.message : message;
      next(new AppError(safeMessage, HTTP_STATUS.TOO_MANY_REQUESTS));
    },
  });
};

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: "Too many attempts, please try again after 15 minutes.",
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many attempts, please try again after 1 hour.",
});

const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many attempts, please try again after 1 hour.",
});

const resetPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many attempts, please try again after 1 hour.",
});

const resendVerificationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many attempts, please try again after 1 hour.",
});

export {
  createRateLimiter,
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  resendVerificationLimiter,
};
