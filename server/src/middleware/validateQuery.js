import AppError from "../utils/AppError.js";
import { formatZodError } from "../utils/validationErrors.js";

const validateQuery = (schema) => (req, res, next) => {
  if (!schema || typeof schema.safeParse !== "function") {
    return next();
  }

  const result = schema.safeParse(req.query);
  if (!result.success) {
    const message = formatZodError(result.error, "Invalid query params");
    return next(new AppError(message, 400));
  }

  req.validatedQuery = result.data;
  return next();
};

export default validateQuery;
