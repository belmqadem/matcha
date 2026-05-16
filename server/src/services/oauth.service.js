import { query } from "../db/pool.js";
import logger from "../utils/logger.js";

export const findOrCreateOAuthUser = async ({
  provider,
  oauthId,
  email,
  firstName,
  lastName,
}) => {
  const byOAuth = await query(
    `SELECT * FROM users
     WHERE oauth_provider = $1 AND oauth_id = $2`,
    [provider, oauthId],
  );

  if (byOAuth.rows.length > 0) {
    logger.debug({ provider, oauthId }, "Existing OAuth user found");
    return { user: byOAuth.rows[0], created: false };
  }

  const byEmail = await query("SELECT * FROM users WHERE email = $1", [email]);

  if (byEmail.rows.length > 0) {
    const existing = byEmail.rows[0];

    if (existing.oauth_provider && existing.oauth_provider !== provider) {
      throw new Error(
        `This email is already registered with ${existing.oauth_provider}. Please login with ${existing.oauth_provider}.`,
      );
    }

    const updated = await query(
      `UPDATE users
       SET oauth_provider = $1, oauth_id = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [provider, oauthId, existing.id],
    );

    logger.info(
      { provider, userId: existing.id },
      "OAuth linked to existing account",
    );
    return { user: updated.rows[0], created: false };
  }

  const baseUsername = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 25);
  let username = baseUsername;
  let attempts = 0;

  while (attempts < 10) {
    const taken = await query("SELECT 1 FROM users WHERE username = $1", [
      username,
    ]);
    if (taken.rows.length === 0) break;
    username = `${baseUsername}${Math.floor(Math.random() * 9000) + 1000}`;
    attempts++;
  }

  const created = await query(
    `INSERT INTO users
      (username, email, first_name, last_name,
       oauth_provider, oauth_id, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6, true)
     RETURNING *`,
    [username, email, firstName, lastName, provider, oauthId],
  );

  logger.info(
    { provider, userId: created.rows[0].id },
    "New OAuth user created",
  );
  return { user: created.rows[0], created: true };
};
