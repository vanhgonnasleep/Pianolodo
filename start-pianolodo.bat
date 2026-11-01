@echo off
title Pianolodo Studio Cockpit
echo ========================================================
echo   Pianolodo - AI Piano Harmony & Studio Cockpit 2.0
echo ========================================================
echo.
echo Launching local production server without development overhead...
if not exist "dist" (
    echo Building production bundle first...
    call npm run build
)
echo Opening Pianolodo in your default browser at http://localhost:4173 ...
start http://localhost:4173
call npx vite preview --port 4173
pause
