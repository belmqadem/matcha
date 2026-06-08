import { z } from "zod";
import {
  AGE_MAX,
  AGE_MIN,
  BROWSE_LIMIT_DEFAULT,
  BROWSE_LIMIT_MAX,
  FAME_MAX,
  FAME_MIN,
  ORDER_OPTIONS,
  PAGE_MIN,
  SORT_OPTIONS,
} from "./validationConstants.js";

export const mapQuerySchema = z
  .object({
    max_km: z.coerce.number().min(1).max(500).default(50),
  })
  .strict();

export const browseQuerySchema = z
  .object({
    sort: z.enum(SORT_OPTIONS).optional(),
    order: z.enum(ORDER_OPTIONS).optional(),
    age_min: z.coerce.number().int().min(AGE_MIN).max(AGE_MAX).optional(),
    age_max: z.coerce.number().int().min(AGE_MIN).max(AGE_MAX).optional(),
    fame_min: z.coerce.number().min(FAME_MIN).max(FAME_MAX).optional(),
    fame_max: z.coerce.number().min(FAME_MIN).max(FAME_MAX).optional(),
    max_km: z.coerce.number().min(0).optional(),
    tags: z.string().optional(),
    page: z.coerce.number().int().min(PAGE_MIN).default(PAGE_MIN),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(BROWSE_LIMIT_MAX)
      .default(BROWSE_LIMIT_DEFAULT),
  })
  .strict();
