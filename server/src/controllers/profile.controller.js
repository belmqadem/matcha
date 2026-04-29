import * as profileService from "../services/profile.service.js";

export const updateProfile = async (req, res, next) => {
  try {
    const user = await profileService.updateProfile(req.user.id, req.body);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

export const updateTags = async (req, res, next) => {
  try {
    const tags = await profileService.updateTags(req.user.id, req.body.tags);
    return res.status(200).json({ tags });
  } catch (err) {
    return next(err);
  }
};

export const uploadPhoto = async (req, res, next) => {
  try {
    const photo = await profileService.uploadPhoto(req.user.id, req.file);
    return res.status(201).json({ photo });
  } catch (err) {
    return next(err);
  }
};

export const deletePhoto = async (req, res, next) => {
  try {
    await profileService.deletePhoto(req.user.id, req.params.photoId);
    return res.status(200).json({ message: "Photo deleted." });
  } catch (err) {
    return next(err);
  }
};

export const setMainPhoto = async (req, res, next) => {
  try {
    await profileService.setMainPhoto(req.user.id, req.params.photoId);
    return res.status(200).json({ message: "Profile picture updated." });
  } catch (err) {
    return next(err);
  }
};

export const getVisitors = async (req, res, next) => {
  try {
    const visitors = await profileService.getVisitors(req.user.id);
    return res.status(200).json({ visitors });
  } catch (err) {
    return next(err);
  }
};

export const getLikedBy = async (req, res, next) => {
  try {
    const likers = await profileService.getLikedBy(req.user.id);
    return res.status(200).json({ likers });
  } catch (err) {
    return next(err);
  }
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
