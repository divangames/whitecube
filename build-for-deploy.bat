@echo off
chcp 65001 >nul
setlocal enableextensions
cd /d "%~dp0"

echo.
echo ============================================
echo  WhiteCube — сборка для деплоя
echo ============================================

REM --- 0. Очистка ---
if exist "dist"       rmdir /s /q "dist"
if exist "deploy"     rmdir /s /q "deploy"
if exist "deploy.zip" del /q "deploy.zip"

REM --- 1. Сборка Vite ---
echo.
echo [1/4] npm run build ...
call npm run build
if errorlevel 1 (
  echo.
  echo [ERROR] Сборка упала. Исправьте ошибки выше и повторите.
  pause
  exit /b 1
)

if not exist "dist\index.html" (
  echo.
  echo [ERROR] dist\index.html не найден после сборки.
  pause
  exit /b 1
)

REM --- 2. Копируем dist -> deploy ---
set "OUT=deploy"
echo.
echo [2/4] Копирование dist в "%OUT%\" ...
mkdir "%OUT%" 2>nul
xcopy /E /I /Y /Q "dist\*" "%OUT%\" >nul
if errorlevel 1 (
  echo [ERROR] xcopy не смог скопировать dist в deploy.
  pause
  exit /b 1
)

REM --- 3. Проверка PHP-эндпоинта ---
if not exist "%OUT%\php\send.php" (
  echo.
  echo [WARN] Не найден %OUT%\php\send.php — форма работать не будет.
  echo        Файл должен лежать в public\php\send.php ^(Vite копирует public автоматически^).
)

REM --- 3b. .htaccess для React Router (Apache) ---
echo.
echo [3/4] .htaccess для SPA-роутинга ...
> "%OUT%\.htaccess" echo Options -MultiViews
>>"%OUT%\.htaccess" echo RewriteEngine On
>>"%OUT%\.htaccess" echo RewriteCond %%{REQUEST_FILENAME} !-f
>>"%OUT%\.htaccess" echo RewriteRule ^ index.html [QSA,L]

REM --- 4. DEPLOY.txt + ZIP ---
echo.
echo [4/4] DEPLOY.txt и архив ...

> "%OUT%\DEPLOY.txt" echo WhiteCube — инструкция по деплою
>>"%OUT%\DEPLOY.txt" echo ============================================
>>"%OUT%\DEPLOY.txt" echo.
>>"%OUT%\DEPLOY.txt" echo Статический фронт на React + PHP-обработчик формы.
>>"%OUT%\DEPLOY.txt" echo.
>>"%OUT%\DEPLOY.txt" echo ЧТО ЗАЛИВАТЬ
>>"%OUT%\DEPLOY.txt" echo --------------------------------------------
>>"%OUT%\DEPLOY.txt" echo Залейте ВСЁ содержимое папки deploy\ в корень
>>"%OUT%\DEPLOY.txt" echo сайта ^(public_html, www, htdocs^).
>>"%OUT%\DEPLOY.txt" echo.
>>"%OUT%\DEPLOY.txt" echo СТРУКТУРА
>>"%OUT%\DEPLOY.txt" echo --------------------------------------------
>>"%OUT%\DEPLOY.txt" echo   index.html, assets\  — фронт
>>"%OUT%\DEPLOY.txt" echo   php\send.php         — отправка заявок в Telegram
>>"%OUT%\DEPLOY.txt" echo   .htaccess            — роутинг для Apache
>>"%OUT%\DEPLOY.txt" echo.
>>"%OUT%\DEPLOY.txt" echo РОУТИНГ
>>"%OUT%\DEPLOY.txt" echo --------------------------------------------
>>"%OUT%\DEPLOY.txt" echo Apache: .htaccess уже включён — всё заработает сразу.
>>"%OUT%\DEPLOY.txt" echo Nginx:  добавьте в server-блок:
>>"%OUT%\DEPLOY.txt" echo   location / { try_files $uri $uri/ /index.html; }
>>"%OUT%\DEPLOY.txt" echo.
>>"%OUT%\DEPLOY.txt" echo TELEGRAM
>>"%OUT%\DEPLOY.txt" echo --------------------------------------------
>>"%OUT%\DEPLOY.txt" echo Токен и chat_id задаются в .env перед сборкой:
>>"%OUT%\DEPLOY.txt" echo   VITE_TELEGRAM_BOT_TOKEN=...
>>"%OUT%\DEPLOY.txt" echo   VITE_TELEGRAM_CHAT_ID=...
>>"%OUT%\DEPLOY.txt" echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Set-Location -LiteralPath '%CD%'; Compress-Archive -Path 'deploy\*' -DestinationPath 'deploy.zip' -Force" >nul 2>&1

if exist "deploy.zip" (
  echo  + deploy.zip создан.
) else (
  echo  - deploy.zip не создан ^(ошибка PowerShell^), это не критично.
)

echo.
echo ============================================
echo  Готово!
echo ============================================
echo  Папка:  %~dp0%OUT%\
if exist "deploy.zip" echo  Архив:  %~dp0deploy.zip
echo.
echo  Заливайте содержимое deploy\ в корень сайта.
echo ============================================
echo.
pause
endlocal
