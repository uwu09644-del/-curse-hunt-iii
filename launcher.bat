@echo off
title Curse Hunt III - PWA Server
echo.
echo  === CURSE HUNT III - PWA + APK Builder ===
echo.
echo  What do you want to do?
echo.
echo  1. Start server + tunnel (test on phone)
echo  2. Build APK via pwabuilder.com (opens browser)
echo  3. Open the app on your phone (WiFi needed)
echo.
set /p choice="Choose (1-3): "

if "%choice%"=="1" goto serve
if "%choice%"=="2" goto apk
if "%choice%"=="3" goto wifi
goto end

:serve
echo.
echo  Starting server...
start /B "" node "%~dp0server.js"
timeout /t 3 >nul
echo  Creating public tunnel...
start "" cmd /c "npx --yes localtunnel --port 8080 --subdomain cursehunt7"
timeout /t 10 >nul
echo.
echo  Server: http://localhost:8080
echo  Tunnel: https://cursehunt7.loca.lt (if available)
echo.
echo  Share the tunnel URL via WhatsApp!
echo.
pause
goto end

:apk
echo.
echo  Starting server + tunnel for APK generation...
start /B "" node "%~dp0server.js"
timeout /t 3 >nul
start "" cmd /c "npx --yes localtunnel --port 8080 --subdomain cursehunt7"
timeout /t 12 >nul
echo.
echo  Opening pwabuilder.com...
start https://www.pwabuilder.com
echo.
echo  1. The server is running and tunnel is being created
echo  2. PWABuilder should open in your browser
echo  3. In pwabuilder.com, enter: https://cursehunt7.loca.lt
echo  4. Click "Start" -> "Package for Android"
echo  5. Download the APK and send via WhatsApp!
echo.
echo  NOTE: If localtunnel fails, you'll see a different URL
echo  in the terminal window - use that URL instead.
echo.
pause
goto end

:wifi
echo.
echo  Finding your local IP...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr IPv4') do set ip=%%a
set ip=%ip: =%
echo.
echo  Make sure the server is running (option 1).
echo  On your phone, open: http://%ip%:8080
echo.
echo  Then tap "Share" in your browser -> "Add to Home Screen"
echo  to install as a real app!
echo.
pause
goto end

:end
