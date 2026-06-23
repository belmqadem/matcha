import { HTTP_STATUS } from "../constants/httpStatus.js";
import logger from "../utils/logger.js";

const isJsonParseError = (err) => {
  return (
    err &&
    (err.type === "entity.parse.failed" ||
      (err instanceof SyntaxError && err.status === HTTP_STATUS.BAD_REQUEST))
  );
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isOperational = err && err.isOperational === true;
  const normalized = isJsonParseError(err)
    ? {
        isOperational: true,
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: "Invalid JSON payload",
      }
    : null;

  const statusCode = normalized
    ? normalized.statusCode
    : isOperational
      ? Number.isInteger(err.statusCode)
        ? err.statusCode
        : HTTP_STATUS.BAD_REQUEST
      : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const message = normalized
    ? normalized.message
    : isOperational && typeof err?.message === "string" && err.message.trim()
      ? err.message
      : isOperational
        ? "Request failed"
        : "Internal server error";

  if (!(normalized?.isOperational || isOperational)) {
    logger.error(
      {
        err,
        method: req.method,
        path: req.originalUrl,
      },
      "Unhandled server error",
    );
  } else {
    logger.warn(
      {
        method: req.method,
        path: req.originalUrl,
        statusCode,
        message,
      },
      "Request failed",
    );
  }

  res.status(statusCode).json({ error: message });
};

export default errorHandler;
