import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import env from "../config/env.js";

const authenticate = (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "matcha",
      audience: "matcha-client",
    });
    req.user = decoded;
    return next();
  } catch (_err) {
    return next(new AppError("Invalid or expired session", 401));
  }
};

export default authenticate;
