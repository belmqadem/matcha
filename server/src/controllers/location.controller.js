import * as locationService from "../services/location.service.js";

export const setManual = async (req, res) => {
  const { latitude, longitude, location_city } = req.body;
  const location = await locationService.setLocationFromCoords(
    req.user.id,
    latitude,
    longitude,
    location_city ?? null,
  );
  return res.status(200).json(location);
};

export const setFromGps = async (req, res) => {
  const { latitude, longitude, location_city } = req.body;
  const location = await locationService.setLocationFromCoords(
    req.user.id,
    latitude,
    longitude,
    location_city ?? null,
  );
  return res.status(200).json(location);
};

export const setFromIp = async (req, res) => {
  const overrideIp =
    process.env.NODE_ENV !== "production" && typeof req.query.ip === "string"
      ? req.query.ip
      : null;

  const location = await locationService.setLocationFromIp(
    req.user.id,
    overrideIp || req.ip,
  );
  return res.status(200).json(location);
};

export default {
  setManual,
  setFromGps,
  setFromIp,
};
