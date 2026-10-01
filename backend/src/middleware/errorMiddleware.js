const errorHandler = (err, req, res, next) => {
  console.error("Request failed:", err);

  const statusCode = Number.isInteger(err.statusCode)
    ? err.statusCode
    : err.name === "ValidationError"
      ? 422
      : err.name === "CastError"
        ? 400
        : 500;

  const message = process.env.NODE_ENV === "production"
    ? statusCode === 503
      ? "Service temporarily unavailable."
      : "Something went wrong."
    : err.message || "Something went wrong.";

  res.status(statusCode).json({
    message,
  });
};

module.exports = errorHandler;