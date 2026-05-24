import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import env from "../config/env.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { get as redisGet } from "../db/redis.js";
import { CacheKeys } from "../utils/cacheKeys.js";

const authenticate = async (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return next(
      new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED),
    );
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "matcha",
      audience: "matcha-client",
    });
  } catch {
    return next(
      new AppError("Invalid or expired session", HTTP_STATUS.UNAUTHORIZED),
    );
  }

  if (decoded.jti) {
    const isBlocked = await redisGet(CacheKeys.blocklist(decoded.jti));
    if (isBlocked) {
      return next(
        new AppError("Session has been invalidated", HTTP_STATUS.UNAUTHORIZED),
      );
    }
  }

  req.user = decoded;
  next();
};

export default authenticate;
