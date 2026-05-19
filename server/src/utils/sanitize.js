import xss from "xss";

export const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return xss(str, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"],
  });
};

export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === "string" ? sanitizeString(value) : value,
    ]),
  );
};
