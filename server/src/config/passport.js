import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FortyTwoStrategy } from "passport-42";
import env from "./env.js";
import { findOrCreateOAuthUser } from "../services/oauth.service.js";
import logger from "../utils/logger.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email returned from Google"));
        }

        const result = await findOrCreateOAuthUser({
          provider: "google",
          oauthId: profile.id,
          email,
          firstName: profile.name?.givenName || "User",
          lastName: profile.name?.familyName || "",
        });

        return done(null, result.user);
      } catch (err) {
        logger.error({ err }, "Google OAuth strategy error");
        return done(err);
      }
    },
  ),
);

passport.use(
  new FortyTwoStrategy(
    {
      clientID: env.FORTYTWO_CLIENT_ID,
      clientSecret: env.FORTYTWO_CLIENT_SECRET,
      callbackURL: env.FORTYTWO_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email returned from 42"));
        }

        const result = await findOrCreateOAuthUser({
          provider: "42",
          oauthId: profile.id.toString(),
          email,
          firstName: profile.name?.givenName || profile.displayName || "User",
          lastName: profile.name?.familyName || "",
        });

        return done(null, result.user);
      } catch (err) {
        logger.error({ err }, "42 OAuth strategy error");
        return done(err);
      }
    },
  ),
);

export default passport;
