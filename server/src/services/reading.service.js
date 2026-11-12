import pool from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { validateReadingDate, validateReadingId, validateReadingPayload } from "../validators/reading.validator.js";

const duplicateReadingError = () =>
  new ApiError(409, "A reading already exists for this slot on the selected date.");

export const createReading = async (userId, payload) => {
  const { readingDate, slot, value } = validateReadingPayload(payload);

  try {
    const result = await pool.query(
      `INSERT INTO readings (user_id, reading_date, slot, value)
       VALUES ($1, $2, $3, $4)
       RETURNING id, reading_date, slot, value, created_at`,
      [userId, readingDate, slot, value]
    );

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw duplicateReadingError();
    }

    throw error;
  }
};

export const getReadingsByDate = async (userId, readingDate) => {
  const validatedDate = validateReadingDate(readingDate);

  const result = await pool.query(
    `SELECT id, reading_date, slot, value, created_at
     FROM readings
     WHERE user_id = $1 AND reading_date = $2
     ORDER BY
       CASE slot
         WHEN 'Morning fasting' THEN 1
         WHEN 'After breakfast' THEN 2
         WHEN 'After lunch' THEN 3
         WHEN 'After dinner' THEN 4
       END`,
    [userId, validatedDate]
  );

  return result.rows;
};

export const updateReading = async (userId, readingId, payload) => {
  const id = validateReadingId(readingId);
  const { readingDate, slot, value } = validateReadingPayload(payload);

  try {
    const result = await pool.query(
      `UPDATE readings
       SET reading_date = $1, slot = $2, value = $3
       WHERE id = $4 AND user_id = $5
       RETURNING id, reading_date, slot, value, created_at`,
      [readingDate, slot, value, id, userId]
    );

    if (result.rowCount === 0) {
      throw new ApiError(404, "Reading not found.");
    }

    return result.rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw duplicateReadingError();
    }

    throw error;
  }
};

export const deleteReading = async (userId, readingId) => {
  const id = validateReadingId(readingId);
  const result = await pool.query(
    `DELETE FROM readings
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [id, userId]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Reading not found.");
  }
};