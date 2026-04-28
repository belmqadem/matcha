import { z } from "zod";
import { isCommonPassword } from "../utils/commonPasswords.js";

const usernameRegex = /^[A-Za-z0-9_]{3,30}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const nameRegex = /^\p{L}+$/u;

export const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(
      usernameRegex,
      "Username must be 3-30 characters and contain only letters, numbers, or underscores",
    ),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      passwordRegex,
      "Password must have upper, lower, number, and special character",
    )
    .refine((v) => !isCommonPassword(v), {
      message: "Password is too common. Please choose a more unique password.",
    }),
  first_name: z
    .string()
    .min(1)
    .max(50)
    .regex(nameRegex, "First name must contain only letters"),
  last_name: z
    .string()
    .min(1)
    .max(50)
    .regex(nameRegex, "Last name must contain only letters"),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const forgotSchema = z.object({
  email: z.string().email(),
});

export const resetSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8)
    .regex(
      passwordRegex,
      "Password must have upper, lower, number, and special character",
    )
    .refine((v) => !isCommonPassword(v), {
      message: "Password is too common. Please choose a more unique password.",
    }),
});
