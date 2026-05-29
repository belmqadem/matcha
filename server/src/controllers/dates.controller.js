import * as datesService from "../services/dates.service.js";

export const proposeDate = async (req, res) => {
  const result = await datesService.proposeDate(req.user.id, req.body);
  return res.status(201).json(result);
};

export const getDates = async (req, res) => {
  const result = await datesService.getDates(req.user.id);
  return res.status(200).json(result);
};

export const getDate = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const result = await datesService.getDate(req.user.id, id);
  return res.status(200).json(result);
};

export const updateDate = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const result = await datesService.updateDate(req.user.id, id, req.body);
  return res.status(200).json(result);
};

export const cancelDate = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const result = await datesService.cancelDate(req.user.id, id);
  return res.status(200).json(result);
};

export default {
  proposeDate,
  getDates,
  getDate,
  updateDate,
  cancelDate,
};
