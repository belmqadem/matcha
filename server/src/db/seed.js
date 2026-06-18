import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { getClient, query } from "./pool.js";
import logger from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "..", "..", "uploads");
const USERS_WITH_PHOTOS = 100;

const TOTAL_USERS = 500;
const TAGS = [
  "vegan",
  "geek",
  "piercing",
  "fitness",
  "music",
  "art",
  "travel",
  "coffee",
  "cats",
  "dogs",
  "gaming",
  "cooking",
  "hiking",
  "photography",
  "reading",
  "movies",
  "yoga",
  "cycling",
  "swimming",
  "dancing",
];
const GENDERS = ["male", "female", "non-binary", "other"];
const PREFERENCES = ["heterosexual", "homosexual", "bisexual"];
const SEED_PHOTOS = {
  female: [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80",
  ],
  male: [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80",
  ],
};

const downloadImage = (url) =>
  new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol
      .get(url, (res) => {
        // Follow redirects
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return downloadImage(res.headers.location)
            .then(resolve)
            .catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });

// Cache downloaded images to avoid re-downloading on re-seed
const imageCache = new Map();

const getOrDownloadImage = async (url) => {
  if (imageCache.has(url)) return imageCache.get(url);
  logger.debug({ url }, "Downloading seed photo...");
  const buffer = await downloadImage(url);
  imageCache.set(url, buffer);
  return buffer;
};

const saveImage = async (buffer, ext = ".jpg") => {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return { filename, url: `/uploads/${filename}` };
};

const preloadPhotos = async () => {
  logger.info("Pre-loading seed photos...");
  const results = { female: [], male: [] };

  for (const url of SEED_PHOTOS.female) {
    try {
      const buffer = await getOrDownloadImage(url);
      results.female.push(buffer);
    } catch (err) {
      logger.warn(
        { err, url },
        "Failed to download female seed photo — skipping",
      );
    }
  }

  for (const url of SEED_PHOTOS.male) {
    try {
      const buffer = await getOrDownloadImage(url);
      results.male.push(buffer);
    } catch (err) {
      logger.warn(
        { err, url },
        "Failed to download male seed photo — skipping",
      );
    }
  }

  logger.info(
    `Loaded ${results.female.length} female + ${results.male.length} male seed photos`,
  );
  return results;
};

async function seed() {
  logger.info("Starting database seeding...");

  // Verify migrations have been run before attempting to seed
  try {
    await query("SELECT 1 FROM tags LIMIT 1");
  } catch {
    logger.error(
      "Tables not found — run migrations first: npm run db:migrate",
    );
    return 1;
  }

  const photoBuffers = await preloadPhotos();

  const client = await getClient();
  let exitCode = 0;

  try {
    await client.query("BEGIN");

    await client.query(
      "INSERT INTO tags (name) SELECT unnest($1::text[]) ON CONFLICT DO NOTHING",
      [TAGS],
    );
    const { rows: tagRows } = await client.query("SELECT id, name FROM tags");
    const tagMap = Object.fromEntries(tagRows.map((row) => [row.name, row.id]));

    const passwordHash = await bcrypt.hash("Password123@@", 12);

    for (let i = 0; i < TOTAL_USERS; i++) {
      const gender = faker.helpers.arrayElement(GENDERS);
      const preference = faker.helpers.arrayElement(PREFERENCES);
      const latitude = parseFloat(
        faker.location.latitude({ min: 33, max: 36 }),
      );
      const longitude = parseFloat(
        faker.location.longitude({ min: -6, max: 0 }),
      );
      const fame = parseFloat((Math.random() * 100).toFixed(2));

      const { rows } = await client.query(
        `INSERT INTO users
          (username, email, password_hash, first_name, last_name,
           gender, sexual_preference, biography, birth_date, fame_rating,
           latitude, longitude, location_city, is_verified, is_online)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true,false)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [
          faker.internet.userName().slice(0, 29),
          faker.internet.email(),
          passwordHash,
          faker.person.firstName(),
          faker.person.lastName(),
          gender,
          preference,
          faker.lorem.sentences(2),
          faker.date.birthdate({ min: 18, max: 60, mode: "age" }),
          fame,
          latitude,
          longitude,
          faker.location.city(),
        ],
      );

      if (rows.length === 0) continue;

      const userId = rows[0].id;

      const userTags = faker.helpers.arrayElements(TAGS, { min: 1, max: 5 });
      await client.query(
        "INSERT INTO user_tags (user_id, tag_id) SELECT $1, unnest($2::int[]) ON CONFLICT DO NOTHING",
        [userId, userTags.map((tag) => tagMap[tag])],
      );

      if (i < USERS_WITH_PHOTOS) {
        const pool =
          gender === "female" && photoBuffers.female.length > 0
            ? photoBuffers.female
            : photoBuffers.male.length > 0
              ? photoBuffers.male
              : null;

        if (pool && pool.length > 0) {
          try {
            const buffer = pool[i % pool.length];
            const { filename, url } = await saveImage(buffer);

            const { rows: photoRows } = await client.query(
              `INSERT INTO photos (user_id, filename, url, order_index)
               VALUES ($1, $2, $3, 0)
               RETURNING id`,
              [userId, filename, url],
            );

            const photoId = photoRows[0].id;

            await client.query(
              "UPDATE users SET profile_picture_id = $1 WHERE id = $2",
              [photoId, userId],
            );
          } catch (err) {
            logger.warn(
              { err, userId },
              "Failed to attach seed photo — skipping for this user",
            );
          }
        }
      }

      if ((i + 1) % 50 === 0) {
        logger.info(`Seeded ${i + 1}/${TOTAL_USERS} users...`);
      }
    }

    await client.query("COMMIT");
    logger.info("Database seeding completed successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error({ err }, "Seeding failed — transaction rolled back.");
    exitCode = 1;
  } finally {
    client.release();
  }

  return exitCode;
}

seed()
  .then((code) => process.exit(code))
  .catch((err) => {
    logger.error({ err }, "Seeding failed unexpectedly");
    process.exit(1);
  });
