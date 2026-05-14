import { z } from "zod";

export const browseQuerySchema = z.object({
  sort: z.enum(["distance", "age", "fame", "tags"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  age_min: z.coerce.number().int().min(18).max(120).optional(),
  age_max: z.coerce.number().int().min(18).max(120).optional(),
  fame_min: z.coerce.number().min(0).max(100).optional(),
  fame_max: z.coerce.number().min(0).max(100).optional(),
  max_km: z.coerce.number().min(0).optional(),
  tags: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
