import { query } from "../db/pool.js";

export async function recalculateFameRating(userId) {
  await query(
    `
    UPDATE users
    SET fame_rating = LEAST(100, GREATEST(0,
      (SELECT COUNT(*) FROM likes  WHERE liked_id   = $1) * 3 +
      (SELECT COUNT(*) FROM visits WHERE visited_id = $1) * 1 -
      (SELECT COUNT(*) FROM blocks WHERE blocked_id = $1) * 5 +
      CASE WHEN (
        gender    IS NOT NULL AND
        biography IS NOT NULL AND biography != '' AND
        latitude  IS NOT NULL AND
        longitude IS NOT NULL AND
        EXISTS (SELECT 1 FROM user_tags WHERE user_id = $1) AND
        EXISTS (SELECT 1 FROM photos    WHERE user_id = $1)
      ) THEN 10 ELSE 0 END
    ))
    WHERE id = $1
  `,
    [userId],
  );
}
