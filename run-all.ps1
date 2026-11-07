# Corporate Risk Reporting (CRR) - Launch Script
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Corporate Risk Reporting (CRR) Platform Launcher" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$env:PATH = "D:\dotnet;$env:PATH"

# 1. Start Backend API
Write-Host "[1/2] Starting .NET 10 Web API on http://localhost:5000..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "D:\dotnet\dotnet.exe" -ArgumentList "run --project backend\src\RiskReporting.Api\RiskReporting.Api.csproj" -PassThru

# 2. Wait for Backend
Start-Sleep -Seconds 4

# 3. Start Frontend
Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Set-Location "frontend"
npm run dev
