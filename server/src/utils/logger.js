import pino from "pino";
import pinoHttp from "pino-http";
import env from "../config/env.js";

const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore(req) {
      return req.url.startsWith("/health");
    },
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
    err(err) {
      return {
        type: err.name,
        message: err.message,
      };
    },
  },
  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage(req, res, err) {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  customLogLevel(req, res, err) {
    if (err || res.statusCode >= 500) {
      return "error";
    }
    if (res.statusCode >= 400) {
      return "warn";
    }
    return "info";
  },
});

export default logger;
