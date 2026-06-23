import { z } from "zod";
import { REPORT_REASON_MAX_LENGTH } from "./validationConstants.js";

export const reportSchema = z
  .object({
    reason: z.string().max(REPORT_REASON_MAX_LENGTH).optional(),
  })
  .strict();
