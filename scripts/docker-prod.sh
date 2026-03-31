#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-build-be}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if [[ ! -f "docker-compose.prod.yml" ]]; then
  echo "Missing docker-compose.prod.yml" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not in PATH" >&2
  exit 1
fi

if [[ ! -f ".env" ]]; then
  echo "Missing .env. Creating from .env.example..."
  if [[ ! -f ".env.example" ]]; then
    echo "Missing .env and .env.example" >&2
    exit 1
  fi
  cp .env.example .env
  echo "Created .env. Update secret values before deployment."
fi

case "$ACTION" in
  build-all)
    docker compose --env-file .env -f docker-compose.prod.yml build --pull --parallel
    ;;
  build-be)
    docker compose --env-file .env -f docker-compose.prod.yml build --pull backend
    ;;
  build-fe)
    docker compose --env-file .env -f docker-compose.prod.yml build --pull frontend
    ;;
  up-all)
    docker compose --env-file .env -f docker-compose.prod.yml up -d
    ;;
  up-be)
    docker compose --env-file .env -f docker-compose.prod.yml up -d postgres redis backend
    ;;
  up-fe)
    docker compose --env-file .env -f docker-compose.prod.yml up -d frontend
    ;;
  down)
    docker compose --env-file .env -f docker-compose.prod.yml down
    ;;
  logs)
    docker compose --env-file .env -f docker-compose.prod.yml logs -f --tail=200
    ;;
  setup)
    docker compose --env-file .env -f docker-compose.prod.yml build --pull --parallel
    docker compose --env-file .env -f docker-compose.prod.yml up -d
    echo "Production stack is up."
    echo "Run migration if needed: docker compose --env-file .env -f docker-compose.prod.yml exec backend npm run prisma:deploy"
    ;;
  *)
    echo "Usage: ./scripts/docker-prod.sh [build-all|build-be|build-fe|up-all|up-be|up-fe|down|logs|setup]"
    exit 1
    ;;
esac
