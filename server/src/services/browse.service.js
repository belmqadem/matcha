import { query } from "../db/pool.js";
import AppError from "../utils/AppError.js";

const buildOrientationFilter = (currentUser, addParam) => {
  const gender = currentUser.gender;
  const pref = currentUser.sexual_preference;

  if (!gender || !pref) {
    return { clause: "1=1" };
  }

  if (pref === "heterosexual") {
    if (gender === "male") {
      const g = addParam("female");
      const p1 = addParam("heterosexual");
      const p2 = addParam("bisexual");
      return {
        clause: `u.gender = ${g} AND u.sexual_preference IN (${p1}, ${p2})`,
      };
    }
    if (gender === "female") {
      const g = addParam("male");
      const p1 = addParam("heterosexual");
      const p2 = addParam("bisexual");
      return {
        clause: `u.gender = ${g} AND u.sexual_preference IN (${p1}, ${p2})`,
      };
    }
  }

  if (pref === "homosexual") {
    if (gender === "male") {
      const g = addParam("male");
      const p1 = addParam("homosexual");
      const p2 = addParam("bisexual");
      return {
        clause: `u.gender = ${g} AND u.sexual_preference IN (${p1}, ${p2})`,
      };
    }
    if (gender === "female") {
      const g = addParam("female");
      const p1 = addParam("homosexual");
      const p2 = addParam("bisexual");
      return {
        clause: `u.gender = ${g} AND u.sexual_preference IN (${p1}, ${p2})`,
      };
    }
  }

  if (pref === "bisexual") {
    if (gender === "male") {
      const female = addParam("female");
      const male = addParam("male");
      const hetero = addParam("heterosexual");
      const homo = addParam("homosexual");
      const bi = addParam("bisexual");
      return {
        clause: `(
          (u.gender = ${female} AND u.sexual_preference IN (${hetero}, ${bi}))
          OR
          (u.gender = ${male} AND u.sexual_preference IN (${homo}, ${bi}))
        )`,
      };
    }

    if (gender === "female") {
      const male = addParam("male");
      const female = addParam("female");
      const hetero = addParam("heterosexual");
      const homo = addParam("homosexual");
      const bi = addParam("bisexual");
      return {
        clause: `(
          (u.gender = ${male} AND u.sexual_preference IN (${hetero}, ${bi}))
          OR
          (u.gender = ${female} AND u.sexual_preference IN (${homo}, ${bi}))
        )`,
      };
    }
  }

  return { clause: "1=1" };
};

const parseTags = (tags) => {
  if (!tags || typeof tags !== "string") {
    return [];
  }

  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

const buildSort = (sort, order) => {
  const normalizedSort = sort || "distance";
  const defaultOrder = normalizedSort === "fame" ? "desc" : "asc";
  const normalizedOrder = ["asc", "desc"].includes(order?.toLowerCase())
    ? order.toLowerCase()
    : defaultOrder;

  if (normalizedSort === "distance") {
    return `distance_km ${normalizedOrder.toUpperCase()} NULLS LAST`;
  }

  if (normalizedSort === "age") {
    return `age_years ${normalizedOrder.toUpperCase()} NULLS LAST`;
  }

  if (normalizedSort === "tags") {
    return `shared_tags ${normalizedOrder.toUpperCase()}`;
  }

  return `u.fame_rating ${normalizedOrder.toUpperCase()}`;
};

export const getSuggestedProfiles = async (currentUserId, queryParams) => {
  const userRes = await query(
    "SELECT id, gender, sexual_preference, latitude, longitude FROM users WHERE id = $1",
    [currentUserId],
  );

  if (!userRes.rows.length) {
    throw new AppError("User not found", 404);
  }

  const currentUser = userRes.rows[0];

  const params = [];
  const addParam = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  const currentUserIdParam = addParam(currentUserId);
  const currentLatParam = addParam(currentUser.latitude);
  const currentLngParam = addParam(currentUser.longitude);

  const whereClauses = [
    `u.id != ${currentUserIdParam}`,
    "u.is_verified = true",
    "u.gender IS NOT NULL",
    `NOT EXISTS (
      SELECT 1 FROM blocks b
      WHERE (b.blocker_id = u.id AND b.blocked_id = ${currentUserIdParam})
         OR (b.blocker_id = ${currentUserIdParam} AND b.blocked_id = u.id)
    )`,
  ];

  const orientation = buildOrientationFilter(currentUser, addParam);
  if (orientation && orientation.clause) {
    whereClauses.push(orientation.clause);
  }

  if (queryParams.fame_min !== undefined) {
    const fameMin = addParam(queryParams.fame_min);
    whereClauses.push(`u.fame_rating >= ${fameMin}`);
  }

  if (queryParams.fame_max !== undefined) {
    const fameMax = addParam(queryParams.fame_max);
    whereClauses.push(`u.fame_rating <= ${fameMax}`);
  }

  if (queryParams.age_min !== undefined) {
    const ageMin = addParam(queryParams.age_min);
    whereClauses.push(
      `u.birth_date IS NOT NULL AND date_part('year', age(u.birth_date)) >= ${ageMin}`,
    );
  }

  if (queryParams.age_max !== undefined) {
    const ageMax = addParam(queryParams.age_max);
    whereClauses.push(
      `u.birth_date IS NOT NULL AND date_part('year', age(u.birth_date)) <= ${ageMax}`,
    );
  }

  if (
    queryParams.max_km !== undefined &&
    currentUser.latitude !== null &&
    currentUser.longitude !== null
  ) {
    const maxKm = addParam(queryParams.max_km);
    whereClauses.push(
      `u.latitude IS NOT NULL AND u.longitude IS NOT NULL AND haversine_km(${currentLatParam}, ${currentLngParam}, u.latitude, u.longitude) <= ${maxKm}`,
    );
  }

  const tagList = parseTags(queryParams.tags);
  if (tagList.length > 0) {
    const tagsParam = addParam(tagList);
    whereClauses.push(
      `EXISTS (
        SELECT 1 FROM user_tags ut
        JOIN tags t ON t.id = ut.tag_id
        WHERE ut.user_id = u.id AND t.name = ANY(${tagsParam}::text[])
      )`,
    );
  }

  const orderBy = buildSort(queryParams.sort, queryParams.order);
  const limit = queryParams.limit || 20;
  const page = queryParams.page || 1;
  const offset = (page - 1) * limit;

  const baseWhere = whereClauses.length
    ? `WHERE ${whereClauses.join(" AND ")}`
    : "";

  const countRes = await query(
    `SELECT COUNT(*)::int AS total
     FROM users u
     ${baseWhere}`,
    params,
  );

  const limitParam = addParam(limit);
  const offsetParam = addParam(offset);

  const dataRes = await query(
    `SELECT
      u.id,
      u.username,
      u.first_name,
      u.last_name,
      u.gender,
      u.sexual_preference,
      u.biography,
      u.fame_rating,
      u.latitude,
      u.longitude,
      u.location_city,
      u.is_online,
      u.last_seen,
      u.profile_picture_id,
      CASE
        WHEN u.latitude IS NOT NULL AND ${currentLatParam} IS NOT NULL
        THEN haversine_km(${currentLatParam}, ${currentLngParam}, u.latitude, u.longitude)
        ELSE NULL
      END AS distance_km,
      CASE
        WHEN u.birth_date IS NOT NULL THEN date_part('year', age(u.birth_date))
        ELSE NULL
      END AS age_years,
      (
        SELECT COUNT(*)
        FROM user_tags ut1
        JOIN user_tags ut2 ON ut1.tag_id = ut2.tag_id
        WHERE ut1.user_id = ${currentUserIdParam}
          AND ut2.user_id = u.id
      ) AS shared_tags,
      COALESCE(
        (
          SELECT json_agg(p ORDER BY p.order_index)
          FROM photos p
          WHERE p.user_id = u.id
        ),
        '[]'
      ) AS photos,
      COALESCE(
        (
          SELECT json_agg(t.name)
          FROM user_tags ut
          JOIN tags t ON ut.tag_id = t.id
          WHERE ut.user_id = u.id
        ),
        '[]'
      ) AS tags
     FROM users u
     ${baseWhere}
     ORDER BY ${orderBy}
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params,
  );

  return {
    users: dataRes.rows,
    total: countRes.rows[0]?.total ?? 0,
    page,
    limit,
  };
};

export default {
  getSuggestedProfiles,
};
