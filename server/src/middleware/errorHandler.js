import { HTTP_STATUS } from "../constants/httpStatus.js";
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isOperational = err && err.isOperational === true;
  const statusCode = isOperational
    ? Number.isInteger(err.statusCode)
      ? err.statusCode
      : HTTP_STATUS.BAD_REQUEST
    : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const message = isOperational ? err.message : "Internal server error";

  if (!isOperational) {
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

  res.status(statusCode).json({ message });
};

export default errorHandler;
