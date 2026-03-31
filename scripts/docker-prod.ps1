param(
  [ValidateSet('build-all', 'build-be', 'build-fe', 'up-all', 'up-be', 'up-fe', 'down', 'logs', 'setup')]
  [string]$Action = 'build-be'
)

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
$ComposeFile = Join-Path $Root 'docker-compose.prod.yml'
$EnvFile = Join-Path $Root '.env'

if (-not (Test-Path $ComposeFile)) {
  Write-Error "Missing docker-compose.prod.yml at: $ComposeFile"
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error 'Docker is not installed or not in PATH.'
}

if (-not (Test-Path $EnvFile)) {
  Write-Host 'Missing .env file. Creating from .env.example...' -ForegroundColor Yellow
  $Example = Join-Path $Root '.env.example'
  if (-not (Test-Path $Example)) {
    Write-Error 'Missing .env and .env.example. Cannot continue.'
  }
  Copy-Item $Example $EnvFile
  Write-Host 'Created .env. Please update secret values before deployment.' -ForegroundColor Yellow
}

Push-Location $Root
try {
  switch ($Action) {
    'build-all' {
      docker compose --env-file .env -f docker-compose.prod.yml build --pull --parallel
    }
    'build-be' {
      docker compose --env-file .env -f docker-compose.prod.yml build --pull backend
    }
    'build-fe' {
      docker compose --env-file .env -f docker-compose.prod.yml build --pull frontend
    }
    'up-all' {
      docker compose --env-file .env -f docker-compose.prod.yml up -d
    }
    'up-be' {
      docker compose --env-file .env -f docker-compose.prod.yml up -d postgres redis backend
    }
    'up-fe' {
      docker compose --env-file .env -f docker-compose.prod.yml up -d frontend
    }
    'down' {
      docker compose --env-file .env -f docker-compose.prod.yml down
    }
    'logs' {
      docker compose --env-file .env -f docker-compose.prod.yml logs -f --tail=200
    }
    'setup' {
      docker compose --env-file .env -f docker-compose.prod.yml build --pull --parallel
      docker compose --env-file .env -f docker-compose.prod.yml up -d
      Write-Host 'Production stack is up. Next step: run DB migration if needed.' -ForegroundColor Green
      Write-Host 'Command: docker compose --env-file .env -f docker-compose.prod.yml exec backend npm run prisma:deploy'
    }
  }
}
finally {
  Pop-Location
}
