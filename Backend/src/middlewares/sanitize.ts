import { Request, Response, NextFunction } from 'express';

// Recursively sanitizes string inputs to prevent XSS and tag injection
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // Strip executable script tags and dangerous HTML attributes
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  } else if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  } else if (value !== null && typeof value === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      cleanObj[key] = sanitizeValue(value[key]);
    }
    return cleanObj;
  }
  return value;
}

export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      try {
        (req.query as any)[key] = sanitizeValue(req.query[key]);
      } catch {
        // Ignore read-only properties
      }
    }
  }
  next();
};
