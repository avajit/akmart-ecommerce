export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly errors?: any[];

  constructor(message: string, statusCode: number, errorCode: string = 'INTERNAL_ERROR', isOperational = true, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Capture stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
