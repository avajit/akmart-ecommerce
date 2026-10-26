import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Custom console format for local development readability
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level}: ${stack || message}${metaString}`;
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    env.NODE_ENV === 'production' ? json() : combine(colorize(), consoleFormat)
  ),
  defaultMeta: { service: 'akmart-backend' },
  transports: [
    new winston.transports.Console(),
  ],
});
