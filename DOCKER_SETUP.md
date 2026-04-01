# Docker Setup

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2 (`docker compose` command available)

## First-time setup

1. Copy environment file (auto-created by scripts if missing):
   - `.env` from `.env.example`
2. Fill required secrets in `.env`:
   - `POSTGRES_PASSWORD`
   - `REDIS_PASSWORD`
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`
   - `R2_*` keys (if using upload)

## Quick commands (Windows)

Run from repository root:

```powershell
scripts\docker-build-prod.bat setup
```

Other useful commands:

```powershell
scripts\docker-build-prod.bat up-all
scripts\docker-build-prod.bat status
scripts\docker-build-prod.bat health
scripts\docker-build-prod.bat logs
scripts\docker-build-prod.bat logs-monitoring
scripts\docker-build-prod.bat down
```

## Quick commands (Linux/macOS)

```bash
./scripts/docker-prod.sh setup
./scripts/docker-prod.sh status
./scripts/docker-prod.sh health
./scripts/docker-prod.sh logs
./scripts/docker-prod.sh logs-monitoring
./scripts/docker-prod.sh down
```

## Service URLs

- Frontend: `http://localhost:80`
- Backend API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3100`

## Monitoring notes

- Metrics endpoint: `/api/metrics`
- Alert rules: `monitoring/prometheus/alerts.yml`
- Grafana dashboard JSON: `monitoring/grafana/dashboards/adk-backend-overview.json`

## Troubleshooting

1. Check status:
   - `scripts\\docker-build-prod.bat status`
2. Check health:
   - `scripts\\docker-build-prod.bat health`
3. View logs:
   - `scripts\\docker-build-prod.bat logs`
4. Rebuild clean:
   - `scripts\\docker-build-prod.bat build-all`
   - `scripts\\docker-build-prod.bat up-all`
