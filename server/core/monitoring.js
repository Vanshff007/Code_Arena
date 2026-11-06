// Error tracking with Sentry. Off unless SENTRY_DSN is set (and always off
// in tests). Only error events are sent, no tracing.
import { readFileSync } from 'fs';
import * as Sentry from '@sentry/node';
import env from './config/env.js';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

// Never send what a player typed or a session: request bodies hold code and
// passwords, headers and cookies hold the session token.
export function scrubEvent(event) {
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.query_string;
  }
  if (event.user) event.user = event.user.id ? { id: event.user.id } : undefined;
  return event;
}

export const monitoringEnabled = Boolean(env.sentryDsn) && env.nodeEnv !== 'test';

if (monitoringEnabled) {
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.nodeEnv,
    release: `codearena-server@${version}`,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: scrubEvent,
  });
}

export function captureError(err, context = {}) {
  if (monitoringEnabled) Sentry.captureException(err, { extra: context });
}

// Lets pending events go out before the process exits.
export function flushMonitoring(timeoutMs = 2000) {
  return monitoringEnabled ? Sentry.flush(timeoutMs) : Promise.resolve(true);
}
