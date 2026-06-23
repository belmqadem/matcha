import { z } from "zod";
import {
  LAT_MAX,
  LAT_MIN,
  LNG_MAX,
  LNG_MIN,
  LOCATION_CITY_MAX_LENGTH,
} from "./validationConstants.js";

const latSchema = z.number().min(LAT_MIN).max(LAT_MAX);
const lngSchema = z.number().min(LNG_MIN).max(LNG_MAX);

export const manualLocationSchema = z
  .object({
    latitude: latSchema,
    longitude: lngSchema,
    location_city: z.string().max(LOCATION_CITY_MAX_LENGTH).optional(),
  })
  .strict();

export const gpsLocationSchema = z
  .object({
    latitude: latSchema,
    longitude: lngSchema,
    location_city: z.string().max(LOCATION_CITY_MAX_LENGTH).optional(),
  })
  .strict();
