import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MonitoringService implements OnModuleInit, OnModuleDestroy {
  private readonly registry: Registry;
  private readonly requestCounter: Counter<string>;
  private readonly requestDuration: Histogram<string>;
  private readonly inFlightRequests: Gauge<string>;
  private readonly dbConnectionsGauge: Gauge<string>;
  private readonly dbUpGauge: Gauge<string>;
  private dbPollTimer: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {
    this.registry = new Registry();

    collectDefaultMetrics({
      register: this.registry,
      prefix: 'adk_backend_',
    });

    this.requestCounter = new Counter({
      name: 'adk_backend_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.requestDuration = new Histogram({
      name: 'adk_backend_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.inFlightRequests = new Gauge({
      name: 'adk_backend_http_in_flight_requests',
      help: 'Current number of in-flight HTTP requests',
      registers: [this.registry],
    });

    this.dbConnectionsGauge = new Gauge({
      name: 'adk_backend_db_connections',
      help: 'Current active PostgreSQL connections for current database',
      registers: [this.registry],
    });

    this.dbUpGauge = new Gauge({
      name: 'adk_backend_db_up',
      help: 'Database connectivity status (1 = up, 0 = down)',
      registers: [this.registry],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.updateDatabaseMetrics();
    this.dbPollTimer = setInterval(() => {
      void this.updateDatabaseMetrics();
    }, 15000);
  }

  onModuleDestroy(): void {
    if (this.dbPollTimer) {
      clearInterval(this.dbPollTimer);
      this.dbPollTimer = null;
    }
  }

  incrementInFlightRequests(): void {
    this.inFlightRequests.inc();
  }

  decrementInFlightRequests(): void {
    this.inFlightRequests.dec();
  }

  observeHttpRequest(method: string, route: string, statusCode: number, durationMs: number): void {
    const labels = {
      method: method.toUpperCase(),
      route: this.normalizeRoute(route),
      status_code: String(statusCode),
    };

    this.requestCounter.inc(labels);
    this.requestDuration.observe(labels, durationMs / 1000);
  }

  getContentType(): string {
    return this.registry.contentType;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  private async updateDatabaseMetrics(): Promise<void> {
    try {
      const result = await this.prisma.$queryRawUnsafe<Array<{ connections: number }>>(
        'SELECT numbackends::int AS connections FROM pg_stat_database WHERE datname = current_database();',
      );

      const connections = result?.[0]?.connections ?? 0;
      this.dbConnectionsGauge.set(connections);
      this.dbUpGauge.set(1);
    } catch {
      this.dbUpGauge.set(0);
      this.dbConnectionsGauge.set(0);
    }
  }

  private normalizeRoute(route: string): string {
    return route
      .replace(/\?.*$/, '')
      .replace(/\/[0-9]+/g, '/:id')
      .replace(/\/[0-9a-fA-F-]{8,}/g, '/:id');
  }
}
