@echo off
cd /d "%~dp0"
echo Stopping old dev servers...
for %%p in (5173 5174 5175) do (
  for /f "tokens=5" %%a in ('netstat -aon ^| findstr /C:":%%p" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
  )
)
timeout /t 1 >nul
start "" http://localhost:5173
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
