import {
  createReading,
  getReadingsByDate,
  updateReading,
  deleteReading,
} from "../services/reading.service.js";

export const addReading = async (req, res) => {
  const reading = await createReading(req.user.userId, req.body);

  res.status(201).json({
    success: true,
    message: "Reading added successfully.",
    data: { reading },
  });
};

export const getDailyReadings = async (req, res) => {
  const readings = await getReadingsByDate(
    req.user.userId,
    req.query.date
  );

  res.status(200).json({
    success: true,
    data: { readings },
  });
};

export const editReading = async (req, res) => {
  const reading = await updateReading(
    req.user.userId,
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Reading updated successfully.",
    data: { reading },
  });
};

export const removeReading = async (req, res) => {
  await deleteReading(req.user.userId, req.params.id);

  res.status(200).json({
    success: true,
    message: "Reading deleted successfully.",
  });
};