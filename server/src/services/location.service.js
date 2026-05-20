import { query } from "../db/pool.js";
import AppError from "../utils/AppError.js";
import { getLocationFromIp } from "../utils/geoip.js";
import { recalculateFameRating } from "../utils/fameRating.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

const isValidLat = (lat) => typeof lat === "number" && lat >= -90 && lat <= 90;
const isValidLng = (lng) =>
  typeof lng === "number" && lng >= -180 && lng <= 180;

export const setLocationFromCoords = async (
  userId,
  latitude,
  longitude,
  locationCity = null,
) => {
  if (!isValidLat(latitude) || !isValidLng(longitude)) {
    throw new AppError("Invalid coordinates", HTTP_STATUS.BAD_REQUEST);
  }

  const result = await query(
    "UPDATE users SET latitude = $1, longitude = $2, location_city = $3, updated_at = NOW() WHERE id = $4",
    [latitude, longitude, locationCity, userId],
  );

  if (result.rowCount === 0) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  await recalculateFameRating(userId);

  return {
    latitude,
    longitude,
    location_city: locationCity,
  };
};

export const setLocationFromIp = async (userId, ip) => {
  const location = await getLocationFromIp(ip);

  if (!location) {
    throw new AppError("Could not determine location from IP", HTTP_STATUS.BAD_REQUEST);
  }

  return setLocationFromCoords(
    userId,
    location.latitude,
    location.longitude,
    location.location_city,
  );
};

export const getMyLocation = async (userId) => {
  const { rows } = await query(
    "SELECT latitude, longitude, location_city FROM users WHERE id = $1",
    [userId],
  );

  if (!rows.length) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  return rows[0];
};

export default {
  setLocationFromCoords,
  setLocationFromIp,
  getMyLocation,
};
