@echo off
echo Starting Multi-Marketplace App...

:: Start Backend in a new window
start "Backend Server -- Do Not Close" cmd /k "cd backend && npm run dev"

:: Wait a moment to let backend initialize
timeout /t 5

:: Start Frontend in a new window
start "Frontend App -- Do Not Close" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Both Backend and Frontend are launching!
echo Please wait for the browser to open or go to:
echo http://localhost:3000 (Backend Status)
echo http://localhost:3001 (Frontend App)
echo ===================================================
pause