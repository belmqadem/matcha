import AppError from "../utils/AppError.js";

const validateQuery = (schema) => (req, res, next) => {
  if (!schema || typeof schema.safeParse !== "function") {
    return next();
  }

  const result = schema.safeParse(req.query);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const messages = Object.entries(fieldErrors)
      .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
      .join("; ");

    return next(new AppError(messages || "Invalid query params", 400));
  }

  req.query = result.data;
  return next();
};

export default validateQuery;
