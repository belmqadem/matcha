import { HTTP_STATUS } from "../constants/httpStatus.js";
import AppError from "../utils/AppError.js";

const notFound = (req, _res, next) => {
  const msg = `Route ${req.method} ${req.originalUrl} not found`;
  next(new AppError(msg, HTTP_STATUS.NOT_FOUND));
};

export default notFound;
