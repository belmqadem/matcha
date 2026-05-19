import { z } from "zod";
import { isCommonPassword } from "../utils/commonPasswords.js";

const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const nameRegex = /^[\p{L}\p{M}]+(?:[ '\-\.][\p{L}\p{M}]+)*$/u;

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    passwordRegex,
    "Password must include uppercase, lowercase, number, and special character",
  )
  .refine(
    (pwd) => !isCommonPassword(pwd),
    "Password is too common. Please choose another.",
  );

export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        usernameRegex,
        "Username can only contain letters, numbers, dots, underscores, or hyphens",
      ),
    first_name: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be at most 50 characters")
      .regex(
        nameRegex,
        "First name may contain letters, spaces, apostrophes, hyphens, or periods",
      ),
    last_name: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be at most 50 characters")
      .regex(
        nameRegex,
        "Last name may contain letters, spaces, apostrophes, hyphens, or periods",
      ),
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
