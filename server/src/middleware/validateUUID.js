import AppError from "../utils/AppError.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const validateUUID = (req, res, next) => {
  if (!UUID_REGEX.test(req.params.id)) {
    return next(new AppError("Invalid user ID", 400));
  }
  return next();
};

export default validateUUID;
