import { z } from "zod";
import {
  AGE_MAX,
  AGE_MIN,
  BROWSE_LIMIT_DEFAULT,
  BROWSE_LIMIT_MAX,
  FAME_MAX,
  FAME_MIN,
  LOCATION_CITY_MAX_LENGTH,
  ORDER_OPTIONS,
  PAGE_MIN,
  SORT_OPTIONS,
} from "./validationConstants.js";

export const searchQuerySchema = z
  .object({
    sort: z.enum(SORT_OPTIONS).optional(),
    order: z.enum(ORDER_OPTIONS).optional(),
    age_min: z.coerce.number().int().min(AGE_MIN).max(AGE_MAX).optional(),
    age_max: z.coerce.number().int().min(AGE_MIN).max(AGE_MAX).optional(),
    fame_min: z.coerce.number().min(FAME_MIN).max(FAME_MAX).optional(),
    fame_max: z.coerce.number().min(FAME_MIN).max(FAME_MAX).optional(),
    max_km: z.coerce.number().min(0).optional(),
    city: z.string().max(LOCATION_CITY_MAX_LENGTH).optional(),
    tags: z.string().optional(),
    page: z.coerce.number().int().min(PAGE_MIN).default(PAGE_MIN),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(BROWSE_LIMIT_MAX)
      .default(BROWSE_LIMIT_DEFAULT),
  })
  .strict()
  .refine((data) => !(data.max_km !== undefined && data.city !== undefined), {
    message: "Cannot filter by both max_km and city at the same time",
  })
  .superRefine((data, ctx) => {
    if (
      data.age_min !== undefined &&
      data.age_max !== undefined &&
      data.age_min > data.age_max
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "age_min must be less than or equal to age_max",
        path: ["age_min"],
      });
    }

    if (
      data.fame_min !== undefined &&
      data.fame_max !== undefined &&
      data.fame_min > data.fame_max
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "fame_min must be less than or equal to fame_max",
        path: ["fame_min"],
      });
    }
  });
