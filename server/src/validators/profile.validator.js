import { z } from "zod";
import {
  AGE_MIN,
  BIO_MAX_LENGTH,
  LOCATION_CITY_MAX_LENGTH,
  TAG_MAX_LENGTH,
  TAG_MIN_LENGTH,
  TAGS_MAX,
} from "./validationConstants.js";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const parseIsoDateOnly = (value) => {
  if (!ISO_DATE_REGEX.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

const getTodayUtc = () => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
};

const isAtLeastAge = (birthDateUtc, years) => {
  const todayUtc = getTodayUtc();
  const cutoff = new Date(
    Date.UTC(
      todayUtc.getUTCFullYear() - years,
      todayUtc.getUTCMonth(),
      todayUtc.getUTCDate(),
    ),
  );
  return birthDateUtc <= cutoff;
};

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
    biography: z.string().max(BIO_MAX_LENGTH).optional(),
    latitude: z.preprocess(toNumber, z.number()).optional(),
    longitude: z.preprocess(toNumber, z.number()).optional(),
    location_city: z.string().max(LOCATION_CITY_MAX_LENGTH).optional(),
    birth_date: z
      .string()
      .superRefine((value, ctx) => {
        const date = parseIsoDateOnly(value);

        if (!date) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "birth_date must be a valid ISO date (YYYY-MM-DD)",
          });
          return;
        }

        if (date > getTodayUtc()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "birth_date cannot be in the future",
          });
        }

        if (!isAtLeastAge(date, AGE_MIN)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `birth_date requires age ${AGE_MIN}+`,
          });
        }
      })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const tagsSchema = z
  .object({
    tags: z
      .array(z.string().min(TAG_MIN_LENGTH).max(TAG_MAX_LENGTH))
      .max(TAGS_MAX),
  })
  .strict();

export const reorderPhotosSchema = z
  .object({
    order: z.array(z.number().int().positive()).min(1).max(5),
  })
  .strict()
  .refine((data) => new Set(data.order).size === data.order.length, {
    message: "Photo IDs must be unique",
  });

export const editPhotoSchema = z
  .object({
    rotate: z.number().int().multipleOf(90).min(-270).max(270).optional(),
    crop: z
      .object({
        left: z.number().int().min(0),
        top: z.number().int().min(0),
        width: z.number().int().min(10),
        height: z.number().int().min(10),
      })
      .optional(),
  })
  .strict()
  .refine((data) => data.rotate !== undefined || data.crop !== undefined, {
    message: "At least one of rotate or crop must be provided",
  });

export const filterPhotoSchema = z
  .object({
    filter: z.enum(["grayscale", "sepia", "blur", "brighten", "darken"]),
    intensity: z.number().min(0).max(100).optional().default(50),
  })
  .strict();
