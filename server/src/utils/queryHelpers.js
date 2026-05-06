export const buildOrientationFilter = (currentUser, addParam) => {
  const gender = currentUser.gender;
  const pref = currentUser.sexual_preference;

  if (!gender || !pref) {
    return { clause: "1=1" };
  }

  if (!["male", "female"].includes(gender)) {
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

export const parseTags = (tags) => {
  if (!tags || typeof tags !== "string") return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

export const buildSort = (sort, order) => {
  const normalizedSort = sort || "distance";
  const defaultOrder = normalizedSort === "fame" ? "desc" : "asc";
  const normalizedOrder = ["asc", "desc"].includes(order?.toLowerCase())
    ? order.toLowerCase()
    : defaultOrder;

  if (normalizedSort === "distance")
    return `distance_km ${normalizedOrder.toUpperCase()} NULLS LAST`;
  if (normalizedSort === "age")
    return `age_years ${normalizedOrder.toUpperCase()} NULLS LAST`;
  if (normalizedSort === "tags")
    return `shared_tags ${normalizedOrder.toUpperCase()} NULLS LAST`;
  return `u.fame_rating ${normalizedOrder.toUpperCase()} NULLS LAST`;
};

export default {
  buildOrientationFilter,
  parseTags,
  buildSort,
};
