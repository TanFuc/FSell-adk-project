import { Injectable } from '@nestjs/common';

export type LogLevel = 'debug' | 'log' | 'warn' | 'error';

export interface LogStreamEntry {
  id: string;
  level: LogLevel;
  scope: string;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

@Injectable()
export class LogStreamService {
  private readonly maxEntries = 500;
  private readonly entries: LogStreamEntry[] = [];

  add(entry: Omit<LogStreamEntry, 'id' | 'timestamp'>): void {
    this.entries.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    });

    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  getRecent(limit = 100): LogStreamEntry[] {
    const capped = Math.max(1, Math.min(500, limit));
    return this.entries.slice(-capped).reverse();
  }
}
