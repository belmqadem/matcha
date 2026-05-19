import { z } from "zod";

const latSchema = z.number().min(-90).max(90);
const lngSchema = z.number().min(-180).max(180);

export const manualLocationSchema = z
  .object({
    latitude: latSchema,
    longitude: lngSchema,
    location_city: z.string().max(100).optional(),
  })
  .strict();

export const gpsLocationSchema = z
  .object({
    latitude: latSchema,
    longitude: lngSchema,
  })
  .strict();
