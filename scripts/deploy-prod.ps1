param(
  [int]$HealthTimeoutSeconds = 300,
  [int]$HealthPollIntervalSeconds = 5
)

$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
$ComposeFile = Join-Path $Root 'docker-compose.prod.yml'
$EnvFile = Join-Path $Root '.env'
$EnvExampleFile = Join-Path $Root '.env.example'
$ComposeArgs = @('--env-file', '.env', '-f', 'docker-compose.prod.yml')

function Ensure-Prerequisites {
  if (-not (Test-Path $ComposeFile)) {
    throw "Missing compose file: $ComposeFile"
  }

  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker is not installed or not in PATH.'
  }

  if (-not (Test-Path $EnvFile)) {
    Write-Host 'Missing .env file. Creating from .env.example...' -ForegroundColor Yellow
    if (-not (Test-Path $EnvExampleFile)) {
      throw 'Missing both .env and .env.example. Cannot continue.'
    }

    Copy-Item $EnvExampleFile $EnvFile
    Write-Host 'Created .env from .env.example. Review secret values before public deployment.' -ForegroundColor Yellow
  }
}

function Wait-BackendHealthy {
  param(
    [int]$TimeoutSeconds,
    [int]$PollIntervalSeconds
  )

  $containerName = 'adk-backend-prod'
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  Write-Host "Waiting for backend container '$containerName' to become healthy..." -ForegroundColor Cyan

  while ((Get-Date) -lt $deadline) {
    $health = ''

    try {
      $health = (docker inspect -f "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" $containerName 2>$null).Trim()
    }
    catch {
      $health = ''
    }

    if ($health -eq 'healthy' -or $health -eq 'running') {
      Write-Host "Backend is ready (status: $health)." -ForegroundColor Green
      return
    }

    Start-Sleep -Seconds $PollIntervalSeconds
  }

  Write-Warning "Backend did not become healthy within $TimeoutSeconds seconds."
  Write-Host 'Recent backend logs:' -ForegroundColor Yellow
  docker compose @ComposeArgs logs --tail=80 backend
  throw 'Deployment aborted: backend health check timeout.'
}

function Assert-SeparateFrontendBackendContainers {
  $backendId = (docker compose @ComposeArgs ps -q backend).Trim()
  $frontendId = (docker compose @ComposeArgs ps -q frontend).Trim()

  if ([string]::IsNullOrWhiteSpace($backendId)) {
    throw 'Backend container was not created.'
  }

  if ([string]::IsNullOrWhiteSpace($frontendId)) {
    throw 'Frontend container was not created.'
  }

  if ($backendId -eq $frontendId) {
    throw 'Invalid deploy state: frontend and backend resolved to the same container.'
  }

  $backendStatus = (docker inspect -f "{{.State.Status}}" $backendId).Trim()
  $frontendStatus = (docker inspect -f "{{.State.Status}}" $frontendId).Trim()

  if ($backendStatus -ne 'running') {
    throw "Backend container is not running (status: $backendStatus)."
  }

  if ($frontendStatus -ne 'running') {
    throw "Frontend container is not running (status: $frontendStatus)."
  }

  Write-Host 'Verified separate runtime containers:' -ForegroundColor Green
  Write-Host "  backend : $backendId"
  Write-Host "  frontend: $frontendId"
}

Push-Location $Root
try {
  Ensure-Prerequisites

  Write-Host 'Step 1/4: Build frontend and backend images...' -ForegroundColor Cyan
  docker compose @ComposeArgs build --pull --parallel

  Write-Host 'Step 2/4: Start production stack...' -ForegroundColor Cyan
  docker compose @ComposeArgs up -d

  Write-Host 'Step 2.5/4: Verify frontend and backend are separate containers...' -ForegroundColor Cyan
  Assert-SeparateFrontendBackendContainers

  Write-Host 'Step 3/4: Wait for backend health...' -ForegroundColor Cyan
  Wait-BackendHealthy -TimeoutSeconds $HealthTimeoutSeconds -PollIntervalSeconds $HealthPollIntervalSeconds

  Write-Host 'Step 4/4: Run Prisma migration and seed...' -ForegroundColor Cyan
  docker compose @ComposeArgs exec -T backend npm run prisma:deploy
  docker compose @ComposeArgs exec -T backend npm run prisma:seed

  Write-Host 'Production deploy completed successfully.' -ForegroundColor Green
  Write-Host 'Helpful commands:' -ForegroundColor Green
  Write-Host '  View logs : docker compose --env-file .env -f docker-compose.prod.yml logs -f --tail=200'
  Write-Host '  Stop all  : docker compose --env-file .env -f docker-compose.prod.yml down'
}
finally {
  Pop-Location
}
