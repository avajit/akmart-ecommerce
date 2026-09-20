import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors to match our standard AppError shape
        const issues = error.issues || [];
        const errorMessages = issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        next(new AppError(`Validation failed: ${errorMessages}`, 400, 'VALIDATION_ERROR'));
      } else {
        next(error);
      }
    }
  };
};
