import { HTTP_STATUS } from "../constants/httpStatus.js";
import { query } from "../db/pool.js";
import AppError from "../utils/AppError.js";
import { get as redisGet, set as redisSet } from "../db/redis.js";
import { CacheKeys } from "../utils/cacheKeys.js";
import { isUserOnline } from "../socket/index.js";
import {
  buildOrientationFilter,
  parseTags,
  buildSort,
} from "../utils/queryHelpers.js";

const applyOnlineStatus = async (users) => {
  if (!users || users.length === 0) {
    return [];
  }

  const statuses = await Promise.all(
    users.map((user) => isUserOnline(user.id)),
  );

  return users.map((user, index) => ({
    ...user,
    is_online: statuses[index],
  }));
};

export const getMapUsers = async (currentUserId, queryParams) => {
  const userRes = await query(
    "SELECT id, gender, sexual_preference, latitude, longitude FROM users WHERE id = $1",
    [currentUserId],
  );

  if (!userRes.rows.length) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  const currentUser = userRes.rows[0];

  if (currentUser.latitude === null || currentUser.longitude === null) {
    return { users: [], total: 0, radius_km: queryParams.max_km };
  }

  const params = [];
  const addParam = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  const currentUserIdParam = addParam(currentUserId);
  const currentLatSQL = `${addParam(Number(currentUser.latitude))}::numeric`;
  const currentLngSQL = `${addParam(Number(currentUser.longitude))}::numeric`;
  const maxKmParam = addParam(queryParams.max_km);

  const orientation = buildOrientationFilter(currentUser, addParam);

  const whereClauses = [
    `u.id != ${currentUserIdParam}::uuid`,
    "u.is_verified = true",
    "u.gender IS NOT NULL",
    "u.latitude IS NOT NULL",
    "u.longitude IS NOT NULL",
    `NOT EXISTS (
      SELECT 1 FROM blocks b
      WHERE (b.blocker_id = u.id AND b.blocked_id = ${currentUserIdParam}::uuid)
         OR (b.blocker_id = ${currentUserIdParam}::uuid AND b.blocked_id = u.id)
    )`,
    `haversine_km(${currentLatSQL}, ${currentLngSQL}, u.latitude, u.longitude) <= ${maxKmParam}`,
  ];

  if (orientation?.clause) {
    whereClauses.push(orientation.clause);
  }

  const baseWhere = `WHERE ${whereClauses.join(" AND ")}`;

  const { rows } = await query(
    `SELECT
      u.id,
      u.username,
      u.first_name,
      u.last_name,
      u.profile_picture_id,
      u.fame_rating,
      u.is_online,
      ROUND(u.latitude::numeric,  2) AS lat,
      ROUND(u.longitude::numeric, 2) AS lng,
      u.location_city,
      haversine_km(${currentLatSQL}, ${currentLngSQL}, u.latitude, u.longitude) AS distance_km,
      COALESCE(
        (SELECT json_agg(t.name)
         FROM user_tags ut
         JOIN tags t ON ut.tag_id = t.id
         WHERE ut.user_id = u.id),
        '[]'
      ) AS tags
    FROM users u
    ${baseWhere}
    ORDER BY distance_km ASC`,
    params,
  );

  const usersWithOnlineStatus = await Promise.all(
    rows.map(async (user) => ({
      ...user,
      is_online: await isUserOnline(user.id),
    })),
  );

  return {
    users: usersWithOnlineStatus,
    total: usersWithOnlineStatus.length,
    radius_km: queryParams.max_km,
    center: {
      lat: Number(currentUser.latitude),
      lng: Number(currentUser.longitude),
    },
  };
};

export const getSuggestedProfiles = async (currentUserId, queryParams) => {
  const cacheKey = CacheKeys.browse(currentUserId, queryParams);
  const cached = await redisGet(cacheKey);
  if (cached) {
    const usersWithOnline = await applyOnlineStatus(cached.users);
    return { ...cached, users: usersWithOnline };
  }

  const userRes = await query(
    "SELECT id, gender, sexual_preference, latitude, longitude FROM users WHERE id = $1",
    [currentUserId],
  );

  if (!userRes.rows.length) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  const currentUser = userRes.rows[0];
  const hasCurrentLocation =
    currentUser.latitude !== null && currentUser.longitude !== null;

  const params = [];
  const addParam = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  const currentUserIdParam = addParam(currentUserId);

  // Use SQL literals for NULL to avoid untyped params in count query
  let currentLatSQL = "NULL::numeric";
  let currentLngSQL = "NULL::numeric";

  if (hasCurrentLocation && queryParams.max_km !== undefined) {
    currentLatSQL = `${addParam(Number(currentUser.latitude))}::numeric`;
    currentLngSQL = `${addParam(Number(currentUser.longitude))}::numeric`;
  }

  // ── WHERE clauses ────────────────────────────────────────────────────────────
  const whereClauses = [
    `u.id != ${currentUserIdParam}`,
    "u.is_verified = true",
    "u.gender IS NOT NULL",
    `NOT EXISTS (
      SELECT 1 FROM blocks b
  		WHERE (b.blocker_id = u.id AND b.blocked_id = ${currentUserIdParam}::uuid)
      OR (b.blocker_id = ${currentUserIdParam}::uuid AND b.blocked_id = u.id)
    )`,
  ];

  const orientation = buildOrientationFilter(currentUser, addParam);
  if (orientation?.clause) {
    whereClauses.push(orientation.clause);
  }

  if (queryParams.fame_min !== undefined) {
    whereClauses.push(`u.fame_rating >= ${addParam(queryParams.fame_min)}`);
  }

  if (queryParams.fame_max !== undefined) {
    whereClauses.push(`u.fame_rating <= ${addParam(queryParams.fame_max)}`);
  }

  if (queryParams.age_min !== undefined) {
    whereClauses.push(
      `u.birth_date IS NOT NULL AND date_part('year', age(u.birth_date)) >= ${addParam(queryParams.age_min)}`,
    );
  }

  if (queryParams.age_max !== undefined) {
    whereClauses.push(
      `u.birth_date IS NOT NULL AND date_part('year', age(u.birth_date)) <= ${addParam(queryParams.age_max)}`,
    );
  }

  if (queryParams.max_km !== undefined && hasCurrentLocation) {
    whereClauses.push(
      `u.latitude IS NOT NULL
       AND u.longitude IS NOT NULL
       AND haversine_km(${currentLatSQL}, ${currentLngSQL}, u.latitude, u.longitude) <= ${addParam(queryParams.max_km)}`,
    );
  }

  const tagList = parseTags(queryParams.tags);
  if (tagList.length > 0) {
    whereClauses.push(
      `EXISTS (
        SELECT 1 FROM user_tags ut
        JOIN tags t ON t.id = ut.tag_id
        WHERE ut.user_id = u.id AND t.name = ANY(${addParam(tagList)}::text[])
      )`,
    );
  }

  // ── Build query parts ────────────────────────────────────────────────────────
  const orderBy = buildSort(queryParams.sort, queryParams.order);
  const limit = queryParams.limit;
  const page = queryParams.page;
  const offset = (page - 1) * limit;
  const baseWhere = `WHERE ${whereClauses.join(" AND ")}`;

  // ── Count query — snapshot params before adding limit/offset ─────────────────
  const countParams = [...params];
  const countRes = await query(
    `SELECT COUNT(*)::int AS total FROM users u ${baseWhere}`,
    countParams,
  );

  if (hasCurrentLocation && queryParams.max_km === undefined) {
    currentLatSQL = `${addParam(Number(currentUser.latitude))}::numeric`;
    currentLngSQL = `${addParam(Number(currentUser.longitude))}::numeric`;
  }

  // ── Add limit/offset after count ─────────────────────────────────────────────
  const limitParam = addParam(limit);
  const offsetParam = addParam(offset);

  // ── Distance select ──────────────────────────────────────────────────────────
  const distanceSelect = `
    CASE
      WHEN ${currentLatSQL} IS NOT NULL AND u.latitude IS NOT NULL
      THEN haversine_km(${currentLatSQL}, ${currentLngSQL}, u.latitude, u.longitude)
      ELSE NULL
    END AS distance_km
  `;

  // ── Data query ───────────────────────────────────────────────────────────────
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
      u.location_city,
      u.is_online,
      u.last_seen,
      u.profile_picture_id,
      ${distanceSelect},
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
        (SELECT json_agg(p ORDER BY p.order_index) FROM photos p WHERE p.user_id = u.id),
        '[]'
      ) AS photos,
      COALESCE(
        (SELECT json_agg(t.name) FROM user_tags ut JOIN tags t ON ut.tag_id = t.id WHERE ut.user_id = u.id),
        '[]'
      ) AS tags
    FROM users u
    ${baseWhere}
    ORDER BY ${orderBy}
    LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params,
  );

  const result = {
    users: dataRes.rows.map((row) => ({ ...row, is_online: null })),
    total: countRes.rows[0]?.total ?? 0,
    page,
    limit,
  };

  await redisSet(cacheKey, result, 120);
  const usersWithOnline = await applyOnlineStatus(result.users);
  return { ...result, users: usersWithOnline };
};

export default { getMapUsers, getSuggestedProfiles };
