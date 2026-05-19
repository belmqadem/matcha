import { z } from "zod";

export const searchQuerySchema = z
  .object({
    sort: z.enum(["distance", "age", "fame", "tags"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    age_min: z.coerce.number().int().min(18).max(120).optional(),
    age_max: z.coerce.number().int().min(18).max(120).optional(),
    fame_min: z.coerce.number().min(0).max(100).optional(),
    fame_max: z.coerce.number().min(0).max(100).optional(),
    max_km: z.coerce.number().min(0).optional(),
    city: z.string().max(100).optional(),
    tags: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
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
