export class ApiError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;

    // Set the prototype explicitly to ensure `instanceof ApiError` works correctly in TS
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
