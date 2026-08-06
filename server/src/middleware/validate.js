/**
 * Middleware wrapper for Zod validation schemas.
 * @param {object} schema - Zod schema or object containing { body, query, params } Zod schemas
 */
export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }
    // If passed a standalone Zod schema without sub-keys, default to req.body
    if (!schema.body && !schema.query && !schema.params && typeof schema.parse === 'function') {
      req.body = schema.parse(req.body);
    }
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({
        error: {
          message: 'Validation failed.',
          code: 'VALIDATION_ERROR',
          details: formattedErrors,
        },
      });
    }
    next(error);
  }
};
