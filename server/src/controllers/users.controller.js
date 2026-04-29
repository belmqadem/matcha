import * as usersService from "../services/users.service.js";

export const getMe = async (req, res, next) => {
  try {
    const user = await usersService.getMe(req.user.id);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const user = await usersService.updateMe(req.user.id, req.body);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

export default {
  getMe,
  updateMe,
};
