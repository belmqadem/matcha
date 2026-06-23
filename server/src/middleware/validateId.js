import AppError from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const validateId =
  (paramName = "id", resourceName = "notification") =>
  (req, res, next) => {
    const value = Number.parseInt(req.params[paramName], 10);
    if (!Number.isInteger(value) || value < 1) {
      return next(
        new AppError(`Invalid ${resourceName} ID`, HTTP_STATUS.BAD_REQUEST),
      );
    }
    return next();
  };

export default validateId;
