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
  .refine((data) => !(data.max_km !== undefined && data.city !== undefined), {
    message: "Cannot filter by both max_km and city at the same time",
  });
