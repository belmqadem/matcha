import * as searchService from "../services/search.service.js";

export const search = async (req, res) => {
  const result = await searchService.searchProfiles(
    req.user.id,
    req.validatedQuery,
  );
  return res.status(200).json(result);
};

export default { search };
