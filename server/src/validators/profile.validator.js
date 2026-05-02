import { z } from "zod";

const toNumber = (val) => {
  if (val === null || val === undefined || val === "") {
    return undefined;
  }
  const num = Number(val);
  return Number.isNaN(num) ? val : num;
};

export const updateProfileSchema = z
  .object({
    gender: z.enum(["male", "female", "non-binary", "other"]).optional(),
    sexual_preference: z
      .enum(["heterosexual", "homosexual", "bisexual"])
      .optional(),
    biography: z.string().max(500).optional(),
    latitude: z.preprocess(toNumber, z.number()).optional(),
    longitude: z.preprocess(toNumber, z.number()).optional(),
    location_city: z.string().max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const tagsSchema = z.object({
  tags: z.array(z.string().min(2).max(30)).max(10),
});
