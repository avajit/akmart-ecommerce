export class StorageError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = 'STORAGE_ERROR') {
    super(message);
    this.name = 'StorageError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class StorageNotFoundError extends StorageError {
  constructor(key: string) {
    super(`Storage object not found: ${key}`, 404, 'STORAGE_NOT_FOUND');
    this.name = 'StorageNotFoundError';
  }
}

export class StorageValidationError extends StorageError {
  constructor(message: string) {
    super(message, 400, 'STORAGE_VALIDATION_ERROR');
    this.name = 'StorageValidationError';
  }
}

export class StorageUploadError extends StorageError {
  constructor(message: string, originalError?: unknown) {
    super(message, 500, 'STORAGE_UPLOAD_ERROR');
    this.name = 'StorageUploadError';
    if (originalError && typeof originalError === 'object' && 'stack' in originalError) {
      this.stack = `${this.stack}\nCaused by: ${(originalError as Error).stack}`;
    }
  }
}

export class StoragePermissionError extends StorageError {
  constructor(message = 'Unauthorized access to storage object') {
    super(message, 403, 'STORAGE_PERMISSION_DENIED');
    this.name = 'StoragePermissionError';
  }
}
