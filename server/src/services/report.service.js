import pool from "../config/db.js";

const createError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const validateDate = (date) => {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError("A valid report date is required.", 400);
  }

  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throw createError("Invalid report date.", 400);
  }

  if (date > new Date().toISOString().slice(0, 10)) {
    throw createError("Report date cannot be in the future.", 400);
  }
};

const getStatistics = async (userId, startDate, endDate) => {
  const result = await pool.query(
    `SELECT
       COALESCE(MAX(value), 0) AS highest,
       COALESCE(MIN(value), 0) AS lowest,
       COALESCE(ROUND(AVG(value)::numeric, 1), 0) AS average,
       COUNT(*) AS count
     FROM readings
     WHERE user_id = $1
       AND reading_date >= $2
       AND reading_date <= $3`,
    [userId, startDate, endDate]
  );

  const stats = result.rows[0];

  return {
    highest: Number(stats.highest),
    lowest: Number(stats.lowest),
    average: Number(stats.average),
    count: Number(stats.count),
  };
};

export const getDailyReport = async (userId, date) => {
  validateDate(date);

  const stats = await getStatistics(userId, date, date);

  const result = await pool.query(
    `SELECT id, reading_date, slot, value
     FROM readings
     WHERE user_id = $1 AND reading_date = $2
     ORDER BY
       CASE slot
         WHEN 'Morning fasting' THEN 1
         WHEN 'After breakfast' THEN 2
         WHEN 'After lunch' THEN 3
         WHEN 'After dinner' THEN 4
       END`,
    [userId, date]
  );

  return {
    date,
    ...stats,
    readings: result.rows,
  };
};

export const getMonthToDateReport = async (userId, date) => {
  validateDate(date);

  const startDate = `${date.slice(0, 7)}-01`;
  const stats = await getStatistics(userId, startDate, date);

  return {
    startDate,
    endDate: date,
    ...stats,
  };
};

export const getPreviousMonthReport = async (userId, date) => {
  validateDate(date);

  const selectedDate = new Date(`${date}T00:00:00.000Z`);

  const previousMonthEnd = new Date(
    Date.UTC(
      selectedDate.getUTCFullYear(),
      selectedDate.getUTCMonth(),
      0
    )
  );

  const previousMonthStart = new Date(
    Date.UTC(
      previousMonthEnd.getUTCFullYear(),
      previousMonthEnd.getUTCMonth(),
      1
    )
  );

  const formatDate = (value) => value.toISOString().slice(0, 10);

  const startDate = formatDate(previousMonthStart);
  const endDate = formatDate(previousMonthEnd);

  const stats = await getStatistics(userId, startDate, endDate);

  return {
    startDate,
    endDate,
    ...stats,
  };
};