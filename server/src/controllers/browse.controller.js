import * as browseService from "../services/browse.service.js";

export const getSuggested = async (req, res) => {
  const result = await browseService.getSuggestedProfiles(
    req.user.id,
    req.validatedQuery || req.query,
  );
  return res.status(200).json(result);
};

export default {
  getSuggested,
};
