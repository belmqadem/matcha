const formatIssue = (issue) => {
  const path = Array.isArray(issue.path) ? issue.path.join(".") : "";
  const field = path || "value";

  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined") {
        return `${field} is required`;
      }
      if (issue.received === "null") {
        return `${field} cannot be null`;
      }
      return `${field} must be a ${issue.expected}`;
    case "too_small":
      if (issue.type === "string") {
        return `${field} must be at least ${issue.minimum} characters`;
      }
      if (issue.type === "array") {
        return `${field} must have at least ${issue.minimum} items`;
      }
      if (issue.type === "number") {
        return `${field} must be >= ${issue.minimum}`;
      }
      return `${field} is too small`;
    case "too_big":
      if (issue.type === "string") {
        return `${field} must be at most ${issue.maximum} characters`;
      }
      if (issue.type === "array") {
        return `${field} must have at most ${issue.maximum} items`;
      }
      if (issue.type === "number") {
        return `${field} must be <= ${issue.maximum}`;
      }
      return `${field} is too large`;
    case "invalid_string":
      if (issue.validation === "email") {
        return `${field} must be a valid email`;
      }
      if (issue.validation === "url") {
        return `${field} must be a valid URL`;
      }
      if (issue.validation === "regex") {
        return `${field} is invalid`;
      }
      return `${field} is invalid`;
    case "invalid_enum_value":
      if (Array.isArray(issue.options)) {
        return `${field} must be one of: ${issue.options.join(", ")}`;
      }
      return `${field} is invalid`;
    case "unrecognized_keys":
      if (Array.isArray(issue.keys) && issue.keys.length > 0) {
        const keys = issue.keys.join(", ");
        return issue.keys.length === 1
          ? `Unrecognized field: ${keys}`
          : `Unrecognized fields: ${keys}`;
      }
      return "Unrecognized field";
    default:
      return issue.message || "Invalid value";
  }
};

export const formatZodError = (error, fallbackMessage) => {
  if (!error || !Array.isArray(error.issues)) {
    return fallbackMessage;
  }

  const messages = error.issues
    .map(formatIssue)
    .filter((msg) => typeof msg === "string" && msg.trim().length > 0);

  return messages.length > 0 ? messages.join("; ") : fallbackMessage;
};

export default {
  formatZodError,
};
