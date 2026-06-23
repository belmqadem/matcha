import { z } from "zod";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from "./validationConstants.js";

export const updateUserSchema = z
  .object({
    first_name: z
      .string()
      .min(NAME_MIN_LENGTH)
      .max(NAME_MAX_LENGTH)
      .regex(
        NAME_REGEX,
        "First name may contain letters, spaces, apostrophes, hyphens, or periods",
      )
      .optional(),
    last_name: z
      .string()
      .min(NAME_MIN_LENGTH)
      .max(NAME_MAX_LENGTH)
      .regex(
        NAME_REGEX,
        "Last name may contain letters, spaces, apostrophes, hyphens, or periods",
      )
      .optional(),
    email: z.string().email("Please provide a valid email address").optional(),
    username: z
      .string()
      .min(USERNAME_MIN_LENGTH)
      .max(USERNAME_MAX_LENGTH)
      .regex(
        USERNAME_REGEX,
        "Username can only contain letters, numbers, dots, underscores, or hyphens",
      )
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
