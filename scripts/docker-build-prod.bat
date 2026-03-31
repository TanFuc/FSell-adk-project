@echo off
setlocal

set ACTION=%1
if "%ACTION%"=="" set ACTION=build

powershell -ExecutionPolicy Bypass -File "%~dp0docker-prod.ps1" -Action %ACTION%

endlocal
