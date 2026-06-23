import { z } from "zod";

export const proposeDateSchema = z
  .object({
    receiver_id: z.string().uuid(),
    scheduled_at: z.string().datetime(),
    location: z.string().max(255).optional(),
  })
  .strict()
  .refine((data) => new Date(data.scheduled_at) > new Date(), {
    message: "scheduled_at must be in the future",
    path: ["scheduled_at"],
  });

export const updateDateSchema = z
  .object({
    status: z.enum(["accepted", "declined"]),
    scheduled_at: z.string().datetime().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.status === "declined" && !data.scheduled_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "scheduled_at is required when declining",
        path: ["scheduled_at"],
      });
    }

    if (data.status === "accepted" && data.scheduled_at !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "scheduled_at must be omitted when accepting",
        path: ["scheduled_at"],
      });
    }
  });
