// Error tracking with Sentry. Off unless VITE_SENTRY_DSN is set at build
// time; the SDK is then loaded as a separate chunk, so builds without a DSN
// do not ship it. Only errors are sent, no tracing or session replay.
import { APP_VERSION } from './version';

// Never send what a player typed or a session: request bodies hold code and
// passwords, headers and cookies hold the session.
export function scrubEvent(event) {
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    delete event.request.headers;
  }
  for (const crumb of event.breadcrumbs ?? []) {
    if (crumb.data) delete crumb.data.body;
  }
  return event;
}

export function initMonitoring(dsn = import.meta.env.VITE_SENTRY_DSN) {
  if (!dsn) return Promise.resolve(false);
  return import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: `codearena-client@${APP_VERSION}`,
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeSend: scrubEvent,
    });
    return true;
  });
}
