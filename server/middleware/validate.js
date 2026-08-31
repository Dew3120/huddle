import { ValidationError } from '../utils/AppError.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));

      return next(new ValidationError(details));
    }

    if (source === 'body') {
      req.body = result.data;
    } else {
      req.validated = req.validated ?? {};
      req.validated[source] = result.data;
    }

    return next();
  };
}
