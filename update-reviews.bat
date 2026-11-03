@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo  Node.js не найден. Установите с https://nodejs.org/
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\puppeteer-extra" (
    echo.
    echo  Устанавливаем зависимости ^(npm install^)...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  Ошибка npm install.
        echo.
        pause
        exit /b 1
    )
)

echo.
echo  Обновление отзывов с 2GIS и Яндекс.Карты...
echo  ------------------------------------------------
echo  Откроется браузер - это нормально, не закрывайте его.
echo.
node scripts/fetch-reviews.mjs --show
echo.
if errorlevel 1 (
    echo  Ошибка при получении отзывов.
) else (
    echo  Готово! Отзывы обновлены в src/data/reviews.json
)
echo.
pause