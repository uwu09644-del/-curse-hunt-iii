Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  CURSE HUNT III - Get APK                ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start server
Write-Host "[1/4] Starting local server..." -ForegroundColor Cyan
$server = Start-Job -ScriptBlock { param($d) Set-Location $d; node server.js } -ArgumentList $projectDir
Start-Sleep 3

# 2. Get public tunnel URL
Write-Host "[2/4] Creating public tunnel..." -ForegroundColor Cyan
$ltJob = Start-Job -ScriptBlock { param($d) Set-Location $d; npx --yes localtunnel --port 8080 2>&1 } -ArgumentList $projectDir
Start-Sleep 12
$ltOutput = Receive-Job -Job $ltJob -ErrorAction SilentlyContinue
$url = ""
if ($ltOutput -match "your url is: (https://[^\s]+)") {
    $url = $matches[1]
}

if (-not $url) {
    Write-Host "  ✗ Tunnel failed. Make sure you're connected to the internet." -ForegroundColor Red
    Write-Host "  Local server still running at http://localhost:8080" -ForegroundColor Yellow
    Write-Host "  On your phone (same WiFi):" -ForegroundColor Yellow
    $ip = (ipconfig | Select-String "IPv4" | Select-Object -First 1).ToString() -replace '.*:\s*'
    Write-Host "  http://$ip`:8080" -ForegroundColor Green
    Write-Host "  Then tap 'Share' → 'Add to Home Screen' to install as PWA." -ForegroundColor Yellow
    pause
    exit
}

Write-Host "  ✓ Public URL: $url" -ForegroundColor Green

# 3. Open browser
Write-Host "[3/4] Opening PWABuilder and your public URL..." -ForegroundColor Cyan
Start-Process "https://www.pwabuilder.com"
Start-Sleep 2
Start-Process $url

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  FOLLOW THESE STEPS:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""
Write-Host "  1. PWABuilder opened in your browser" -ForegroundColor White
Write-Host "  2. PASTE this URL into the input box:" -ForegroundColor White
Write-Host "     $url" -ForegroundColor Green
Write-Host "  3. Click 'Start'" -ForegroundColor White
Write-Host "  4. Click 'Package for Android'" -ForegroundColor White
Write-Host "  5. Click 'Download' → save the APK" -ForegroundColor White
Write-Host "  6. Send the .apk file via WhatsApp!" -ForegroundColor White
Write-Host ""
Write-Host "  OR just add to home screen directly:" -ForegroundColor Yellow
Write-Host "  Open $url on your phone" -ForegroundColor Green
Write-Host "  → Share → 'Add to Home Screen' (instant PWA install)" -ForegroundColor Yellow
Write-Host ""
Write-Host "[4/4] Press any key to stop the server..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Stop-Job $server -ErrorAction SilentlyContinue
Stop-Job $ltJob -ErrorAction SilentlyContinue
Remove-Job * -ErrorAction SilentlyContinue
