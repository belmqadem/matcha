import rateLimit from "express-rate-limit";

const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    limit: options.limit || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: options.message || "Too many requests, please try again later.",
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
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
};
