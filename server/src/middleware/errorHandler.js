/**
 * Centralized Express error handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(statusCode).json({
    error: {
      message,
      code,
    },
  });
};
