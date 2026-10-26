import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { Prisma } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let errors: any[] | undefined = undefined;

  // 1. Handle our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
    errors = err.errors;
  } 
  // 1b. Handle CORS policy rejections cleanly with HTTP 403 Forbidden
  else if (err.message && err.message.includes('CORS policy')) {
    statusCode = 403;
    message = 'Cross-Origin Request Blocked by CORS policy.';
    errorCode = 'CORS_REJECTED';
  }
  // 2. Handle Prisma Database Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400; // Bad Request
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ');
      message = target ? `Duplicate entry for ${target}.` : 'Duplicate database entry.';
      errorCode = 'DB_DUPLICATE_ENTRY';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Database record not found.';
      errorCode = 'DB_RECORD_NOT_FOUND';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      message = 'Database foreign key constraint violation. A referenced record does not exist or is in use.';
      errorCode = 'DB_FOREIGN_KEY_VIOLATION';
    } else {
      statusCode = 400;
      message = env.NODE_ENV === 'production'
        ? 'Database operation failed. Please verify your request data.'
        : `Database Error: ${err.message}`;
      errorCode = `DB_ERROR_${err.code}`;
    }
  } 
  // 3. Handle Prisma Validation Errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Database validation failed.';
    errorCode = 'DB_VALIDATION_ERROR';
  }
  // 4. Handle JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
    errorCode = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired.';
    errorCode = 'TOKEN_EXPIRED';
  } 
  // 5. Handle Express Body-Parser Errors
  else if ('type' in err && typeof (err as Record<string, unknown>).type === 'string') {
    const errType = (err as Record<string, unknown>).type;
    if (errType === 'entity.too.large') {
      statusCode = 413;
      message = 'Payload too large. Request body exceeds the allowed limit.';
      errorCode = 'PAYLOAD_TOO_LARGE';
    } else if (errType === 'entity.parse.failed' || err instanceof SyntaxError) {
      statusCode = 400;
      message = 'Malformed JSON syntax in request body.';
      errorCode = 'INVALID_JSON';
    }
  } else if (err instanceof SyntaxError) {
    statusCode = 400;
    message = 'Malformed JSON syntax in request body.';
    errorCode = 'INVALID_JSON';
  }
  // 6. Unhandled / Unexpected Errors
  else {
    // Log unexpected errors through structured logger
    logger.error('Unhandled Application Exception', { error: err.message, stack: err.stack });
  }

  // Build the standardized unified response payload adhering to contract
  interface ErrorResponse {
    success: boolean;
    message: string;
    errors?: any[];
    error: {
      code: number;
      errorCode: string;
      message: string;
    };
  }

  const errorResponse: ErrorResponse = {
    success: false,
    message,
    ...(errors ? { errors } : {}),
    error: {
      code: statusCode,
      errorCode,
      message,
    }
  };

  res.status(statusCode).json(errorResponse);
};
