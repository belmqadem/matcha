import { HTTP_STATUS } from "../constants/httpStatus.js";
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = Number.isInteger(err.statusCode)
    ? err.statusCode
    : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal server error";

  if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
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

  const payload = { message };

  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

export default errorHandler;
