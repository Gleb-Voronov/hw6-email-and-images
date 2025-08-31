import createHttpError from "http-errors";

export const validateBody = (requiredFields) => {
  return (req, res, next) => {
    try {
      for (const field of requiredFields) {
        if (!req.body[field]) {
          throw createHttpError(400, `Missing required field: ${field}`);
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
