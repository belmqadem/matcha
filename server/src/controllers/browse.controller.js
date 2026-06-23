import * as browseService from "../services/browse.service.js";

export const getMapUsers = async (req, res) => {
  const result = await browseService.getMapUsers(
    req.user.id,
    req.validatedQuery,
  );
  res.status(200).json(result);
};

export const getSuggested = async (req, res) => {
  const result = await browseService.getSuggestedProfiles(
    req.user.id,
    req.validatedQuery || req.query,
  );
  return res.status(200).json(result);
};

export default {
  getMapUsers,
  getSuggested,
};
