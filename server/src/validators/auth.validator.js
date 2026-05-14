import { z } from "zod";
import { isCommonPassword } from "../utils/commonPasswords.js";

const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const nameRegex = /^[\p{L}\p{M}]+(?:[ '\-\.][\p{L}\p{M}]+)*$/u;

const passwordSchema = z
  .string()
  .min(8)
  .regex(
    passwordRegex,
    "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
  )
  .refine((pwd) => !isCommonPassword(pwd), "Password is too common");

export const registerSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(
      usernameRegex,
      "Username can only contain letters, numbers, dots, underscores, or hyphens",
    ),
  first_name: z
    .string()
    .min(1)
    .max(50)
    .regex(
      nameRegex,
      "First name may contain letters, spaces, apostrophes, hyphens, or periods",
    ),
  last_name: z
    .string()
    .min(1)
    .max(50)
    .regex(
      nameRegex,
      "Last name may contain letters, spaces, apostrophes, hyphens, or periods",
    ),
  password: passwordSchema,
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const forgotSchema = z.object({
  email: z.string().email(),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export const resetSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
