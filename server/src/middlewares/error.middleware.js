export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode = Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode <= 599
    ? err.statusCode
    : 500;
  if (statusCode >= 500) console.error("API Error:", err);

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error."
        : err.message,
  });
};