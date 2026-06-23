import AppError from "../utils/AppError.js";
import { formatZodError } from "../utils/validationErrors.js";

const validate = (schema) => (req, res, next) => {
  if (!schema || typeof schema.safeParse !== "function") {
    return next();
  }

  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = formatZodError(result.error, "Invalid request body");
    return next(new AppError(message, 400));
  }

  req.body = result.data;
  return next();
};

export default validate;
