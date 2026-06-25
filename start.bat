@echo off
echo Starting Game Hub...
echo.

echo Starting server on port 3001...
start "Server" cmd /k "node server/index.js"

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Starting client on port 3000...
start "Client" cmd /k "npx live-server src --port=3000 --open=/index.html"

echo.
echo Game Hub is starting!
echo Server: http://localhost:3001
echo Client: http://localhost:3000
echo.
pause
