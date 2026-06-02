import { z } from "zod";
import {
  CHAT_LIMIT_DEFAULT,
  CHAT_LIMIT_MAX,
  PAGE_MIN,
} from "./validationConstants.js";

export const messagesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(PAGE_MIN).default(PAGE_MIN),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(CHAT_LIMIT_MAX)
      .default(CHAT_LIMIT_DEFAULT),
  })
  .strict();
