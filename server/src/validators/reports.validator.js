import { z } from "zod";
export const reportSchema = z
  .object({
    reason: z.string().max(500).optional(),
  })
  .strict();
