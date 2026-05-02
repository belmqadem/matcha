import AppError from "../utils/AppError.js";

const validate = (schema) => (req, res, next) => {
  if (!schema || typeof schema.safeParse !== "function") {
    return next();
  }

  const result = schema.safeParse(req.body);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const messages = Object.entries(fieldErrors)
      .map(([field, errs]) => `${field}: ${errs.join(", ")}`)
      .join("; ");

    return next(new AppError(messages || "Invalid request body", 400));
  }

  req.body = result.data;
  return next();
};

export default validate;
