@echo off
setlocal
set "GAME_DIR=%~dp0"
set "PYTHON_CMD=python"

where python >nul 2>&1
if errorlevel 1 (
  where py >nul 2>&1
  if errorlevel 1 (
    echo [HATA] Oyunu baslatmak icin Python 3 bulunamadi.
    echo Python 3 kurduktan sonra bu dosyayi yeniden calistirin.
    pause
    exit /b 1
  )
  set "PYTHON_CMD=py -3"
)

powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) { exit 1 }"
if errorlevel 1 (
  echo [HATA] 8000 numarali port baska bir uygulama tarafindan kullaniliyor.
  echo O uygulamayi kapatip yeniden deneyin.
  pause
  exit /b 1
)

start "Kutup Bayrak Kasifi Sunucusu" /min %PYTHON_CMD% -m http.server 8000 --bind 127.0.0.1 --directory "%GAME_DIR%"
timeout /t 2 /nobreak >nul

powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 3; if ($r.StatusCode -ne 200) { exit 1 } } catch { exit 1 }"
if errorlevel 1 (
  echo [HATA] Yerel oyun sunucusu baslatilamadi.
  pause
  exit /b 1
)

start "" "http://127.0.0.1:8000/"

endlocal
