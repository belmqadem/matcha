import { HTTP_STATUS } from "../constants/httpStatus.js";

const notFound = (req, _res, next) => {
  const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  error.statusCode = HTTP_STATUS.NOT_FOUND;
  next(error);
};

export default notFound;
