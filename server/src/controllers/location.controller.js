import * as locationService from "../services/location.service.js";

export const setManual = async (req, res, next) => {
  try {
    const { latitude, longitude, location_city } = req.body;
    const location = await locationService.setLocationFromCoords(
      req.user.id,
      latitude,
      longitude,
      location_city ?? null,
    );
    return res.status(200).json(location);
  } catch (err) {
    return next(err);
  }
};

export const setFromGps = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const location = await locationService.setLocationFromCoords(
      req.user.id,
      latitude,
      longitude,
      null,
    );
    return res.status(200).json(location);
  } catch (err) {
    return next(err);
  }
};

export const setFromIp = async (req, res, next) => {
  try {
    const location = await locationService.setLocationFromIp(
      req.user.id,
      req.ip,
    );
    return res.status(200).json(location);
  } catch (err) {
    return next(err);
  }
};

export default {
  setManual,
  setFromGps,
  setFromIp,
};
