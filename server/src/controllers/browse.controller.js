import * as browseService from "../services/browse.service.js";

export const getSuggested = async (req, res, next) => {
  try {
    const result = await browseService.getSuggestedProfiles(
      req.user.id,
      req.query,
    );
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

export default {
  getSuggested,
};
