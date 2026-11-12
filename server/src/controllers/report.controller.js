import {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport,
} from "../services/report.service.js";

export const dailyReport = async (req, res) => {
  const report = await getDailyReport(req.user.userId, req.query.date);

  res.status(200).json({
    success: true,
    data: { report },
  });
};

export const monthToDateReport = async (req, res) => {
  const report = await getMonthToDateReport(req.user.userId, req.query.date);

  res.status(200).json({
    success: true,
    data: { report },
  });
};

export const previousMonthReport = async (req, res) => {
  const report = await getPreviousMonthReport(req.user.userId, req.query.date);

  res.status(200).json({
    success: true,
    data: { report },
  });
};