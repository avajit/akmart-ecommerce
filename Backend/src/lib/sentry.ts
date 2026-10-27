import * as Sentry from '@sentry/node';
import { env } from '../config/env';

export const initBackendSentry = () => {
  if (env.ENABLE_SENTRY && env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1.0,
    });
    console.log('🛡️ Sentry Performance & Error Monitoring active for Backend');
  }
};
