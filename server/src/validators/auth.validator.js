import { z } from "zod";
import { isCommonPassword } from "../utils/commonPasswords.js";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from "./validationConstants.js";

const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  )
  .regex(
    PASSWORD_REGEX,
    "Password must include uppercase, lowercase, number, and special character",
  )
  .refine(
    (pwd) => !isCommonPassword(pwd),
    "Password is too common. Please choose another.",
  );

export const registerSchema = z
  .object({
    first_name: z
      .string()
      .min(NAME_MIN_LENGTH, "First name is required")
      .max(
        NAME_MAX_LENGTH,
        `First name must be at most ${NAME_MAX_LENGTH} characters`,
      )
      .regex(
        NAME_REGEX,
        "First name may contain letters, spaces, apostrophes, hyphens, or periods",
      ),
    last_name: z
      .string()
      .min(NAME_MIN_LENGTH, "Last name is required")
      .max(
        NAME_MAX_LENGTH,
        `Last name must be at most ${NAME_MAX_LENGTH} characters`,
      )
      .regex(
        NAME_REGEX,
        "Last name may contain letters, spaces, apostrophes, hyphens, or periods",
      ),
    username: z
      .string()
      .min(
        USERNAME_MIN_LENGTH,
        `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
      )
      .max(
        USERNAME_MAX_LENGTH,
        `Username must be at most ${USERNAME_MAX_LENGTH} characters`,
      )
      .regex(
        USERNAME_REGEX,
        "Username can only contain letters, numbers, dots, underscores, or hyphens",
      ),
    email: z.string().email("Please enter a valid email address"),
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export const forgotSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
  })
  .strict();

export const resendVerificationSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
  })
  .strict();

export const resetSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: passwordSchema,
  })
  .strict();
