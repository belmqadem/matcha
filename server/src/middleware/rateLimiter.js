import rateLimit from "express-rate-limit";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import AppError from "../utils/AppError.js";

const DEFAULT_MESSAGE = "Too many requests, please try again later.";

const createRateLimiter = (options) => {
  const message = options.message || DEFAULT_MESSAGE;
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    limit: options.limit || 100,
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
  message: "Too many login attempts, please try again after 15 minutes.",
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  message: "Too many registration attempts, please try again after 1 hour.",
});

const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many forgot password attempts, please try again after 1 hour.",
});

const resetPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: "Too many reset password attempts, please try again after 1 hour.",
});

export {
  createRateLimiter,
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
};
