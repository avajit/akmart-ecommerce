import * as Sentry from '@sentry/react';

export const initFrontendSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const isEnabled = import.meta.env.VITE_ENABLE_SENTRY === 'true' || Boolean(dsn);

  if (isEnabled && dsn) {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: 0.2,
    });
    console.log('🛡️ Sentry Error Monitoring active for Frontend');
  }
};
