import * as profileService from "../services/profile.service.js";

export const updateProfile = async (req, res) => {
  const user = await profileService.updateProfile(req.user.id, req.body);
  return res.status(200).json({ user });
};

export const updateTags = async (req, res) => {
  const tags = await profileService.updateTags(req.user.id, req.body.tags);
  return res.status(200).json({ tags });
};

export const uploadPhoto = async (req, res) => {
  const photo = await profileService.uploadPhoto(req.user.id, req.file);
  return res.status(201).json({ photo });
};

export const deletePhoto = async (req, res) => {
  await profileService.deletePhoto(req.user.id, req.params.photoId);
  return res.status(200).json({ message: "Photo deleted." });
};

export const setMainPhoto = async (req, res) => {
  await profileService.setMainPhoto(req.user.id, req.params.photoId);
  return res.status(200).json({ message: "Profile picture updated." });
};

export const getVisitors = async (req, res) => {
  const visitors = await profileService.getVisitors(req.user.id);
  return res.status(200).json({ visitors });
};

export const getLikedBy = async (req, res) => {
  const likers = await profileService.getLikedBy(req.user.id);
  return res.status(200).json({ likers });
};

export default {
  updateProfile,
  updateTags,
  uploadPhoto,
  deletePhoto,
  setMainPhoto,
  getVisitors,
  getLikedBy,
};
