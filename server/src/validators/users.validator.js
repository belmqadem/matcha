import { z } from "zod";

const usernameRegex = /^[A-Za-z0-9_]{3,30}$/;
const nameRegex = /^[\p{L}\p{M}]+(?:[ '\-\.][\p{L}\p{M}]+)*$/u;

export const updateUserSchema = z
  .object({
    first_name: z
      .string()
      .min(1)
      .max(50)
      .regex(
        nameRegex,
        "First name may contain letters, spaces, apostrophes, hyphens, or periods",
      )
      .optional(),
    last_name: z
      .string()
      .min(1)
      .max(50)
      .regex(
        nameRegex,
        "Last name may contain letters, spaces, apostrophes, hyphens, or periods",
      )
      .optional(),
    email: z.string().email().optional(),
    username: z
      .string()
      .min(3)
      .max(30)
      .regex(
        usernameRegex,
        "Username must be 3-30 characters and contain only letters, numbers, or underscores",
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
