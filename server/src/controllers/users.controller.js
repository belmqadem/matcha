import * as usersService from "../services/users.service.js";

export const getMe = async (req, res) => {
  const user = await usersService.getMe(req.user.id);
  return res.status(200).json({ user });
};

export const updateMe = async (req, res) => {
  const user = await usersService.updateMe(req.user.id, req.body);
  return res.status(200).json({ user });
};

export default {
  getMe,
  updateMe,
};
