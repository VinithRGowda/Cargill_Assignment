@echo off
echo ==================================================
echo   Corporate Risk Reporting (CRR) Platform Launcher
echo ==================================================
set PATH=D:\dotnet;%PATH%

echo [1/2] Starting .NET 10 API on http://localhost:5000...
start "CRR Backend API" cmd /k "cd /d "%~dp0backend" && dotnet run --project src\RiskReporting.Api\RiskReporting.Api.csproj"

timeout /t 4 /nobreak >nul

echo [2/2] Starting React Frontend on http://localhost:5173...
start "CRR Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Both services launched! Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

