type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  scope: string;
  message: string;
  timestamp: string;
  payload?: unknown;
}

declare global {
  interface Window {
    __APP_LOGS__?: LogEntry[];
  }
}

const MAX_LOG_ENTRIES = 500;

function pushLog(entry: LogEntry): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window.__APP_LOGS__) {
    window.__APP_LOGS__ = [];
  }

  window.__APP_LOGS__.push(entry);
  if (window.__APP_LOGS__.length > MAX_LOG_ENTRIES) {
    window.__APP_LOGS__.shift();
  }

  window.dispatchEvent(new CustomEvent('app-log', { detail: entry }));
}

function write(level: LogLevel, scope: string, message: string, payload?: unknown): void {
  pushLog({
    level,
    scope,
    message,
    payload,
    timestamp: new Date().toISOString(),
  });
}

export const appLogger = {
  debug: (scope: string, message: string, payload?: unknown) =>
    write('debug', scope, message, payload),
  info: (scope: string, message: string, payload?: unknown) =>
    write('info', scope, message, payload),
  warn: (scope: string, message: string, payload?: unknown) =>
    write('warn', scope, message, payload),
  error: (scope: string, message: string, payload?: unknown) =>
    write('error', scope, message, payload),
};
