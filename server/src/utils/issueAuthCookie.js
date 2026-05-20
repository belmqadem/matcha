import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const issueAuthCookie = (res, user) => {
  const token = jwt.sign(
    { id: user.id, username: user.username },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
      algorithm: "HS256",
      issuer: "matcha",
      audience: "matcha-client",
    },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
    signed: false,
  });

  return token;
};
