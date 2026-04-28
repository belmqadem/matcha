import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { getClient } from "./pool.js";
import logger from "../utils/logger.js";

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
const GENDERS = ["male", "female", "non-binary"];
const PREFERENCES = ["heterosexual", "homosexual", "bisexual"];

async function seed() {
  logger.info("Starting database seeding...");
  const client = await getClient();

  let exitCode = 0;

  try {
    await client.query("BEGIN");

    // Seed tags and build id map
    await client.query(
      "INSERT INTO tags (name) SELECT unnest($1::text[]) ON CONFLICT DO NOTHING",
      [TAGS],
    );
    const { rows: tagRows } = await client.query("SELECT id, name FROM tags");
    const tagMap = Object.fromEntries(tagRows.map((row) => [row.name, row.id]));

    // Pre-hash once — all seed users share the same password
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
           gender, sexual_preference, biography, fame_rating,
           latitude, longitude, location_city, is_verified, is_online)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,false)
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
          fame,
          latitude,
          longitude,
          faker.location.city(),
        ],
      );

      if (rows.length === 0) continue;

      const userId = rows[0].id;

      // Batch all tag inserts for this user in one query
      const userTags = faker.helpers.arrayElements(TAGS, { min: 1, max: 5 });
      const tagValues = userTags
        .map((tag) => `('${userId}', ${tagMap[tag]})`)
        .join(", ");
      await client.query(
        `INSERT INTO user_tags (user_id, tag_id) VALUES ${tagValues} ON CONFLICT DO NOTHING`,
      );

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
