#!/usr/bin/env pwsh
# LivePay Chrome Extension Validator

$ExtensionPath = "c:\Users\demar\Documents\GitHub\LivePay\chrome-extension-livepay"
$ErrorsFound = @()
$WarningsFound = @()
$SuccessCount = 0

Write-Host "Extension Validator" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if extension folder exists
Write-Host "Test 1: Extension folder exists" -NoNewline
if (Test-Path $ExtensionPath) {
    Write-Host " - OK" -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host " - FAIL" -ForegroundColor Red
    $ErrorsFound += "Extension folder not found at $ExtensionPath"
    exit 1
}

# Test 2: Check if manifest.json exists and is valid JSON
Write-Host "Test 2: manifest.json is valid JSON" -NoNewline
$ManifestPath = Join-Path $ExtensionPath "manifest.json"
if (Test-Path $ManifestPath) {
    try {
        $Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
        Write-Host " - OK" -ForegroundColor Green
        $SuccessCount++
    } catch {
        Write-Host " - FAIL" -ForegroundColor Red
        $ErrorsFound += "manifest.json parse error: $($_.Exception.Message)"
    }
} else {
    Write-Host " - FAIL" -ForegroundColor Red
    $ErrorsFound += "manifest.json not found"
}

# Test 3: Check manifest version
Write-Host "Test 3: Manifest version is 3" -NoNewline
if ($Manifest.manifest_version -eq 3) {
    Write-Host " - OK" -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host " - WARNING" -ForegroundColor Yellow
    $WarningsFound += "Manifest version is $($Manifest.manifest_version)"
}

# Test 4: Check required permissions
Write-Host "Test 4: Has tabs and storage permissions" -NoNewline
$HasTabsPermission = $Manifest.permissions -contains "tabs"
$HasStoragePermission = $Manifest.permissions -contains "storage"
if ($HasTabsPermission -and $HasStoragePermission) {
    Write-Host " - OK" -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host " - FAIL" -ForegroundColor Red
    $ErrorsFound += "Missing permissions - tabs: $HasTabsPermission, storage: $HasStoragePermission"
}

# Test 5: Check host permissions
Write-Host "Test 5: Host permissions are set" -NoNewline
$HostPerms = $Manifest.host_permissions -join ","
if ($Manifest.host_permissions.Count -gt 0) {
    Write-Host " - OK" -ForegroundColor Green
    Write-Host "   Current: $HostPerms" -ForegroundColor Gray
    $SuccessCount++
} else {
    Write-Host " - FAIL" -ForegroundColor Red
    $ErrorsFound += "No host permissions found"
}

# Test 6: Check if background.js exists
Write-Host "Test 6: background.js exists" -NoNewline
$BackgroundPath = Join-Path $ExtensionPath "background.js"
if (Test-Path $BackgroundPath) {
    Write-Host " - OK" -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host " - FAIL" -ForegroundColor Red
    $ErrorsFound += "background.js not found"
}

# Test 7: Check background.js for required code
Write-Host "Test 7: background.js has required functions" -NoNewline
$BackgroundContent = Get-Content $BackgroundPath -Raw
$HasPostEvent = $BackgroundContent -match "function postEvent"
$HasClassify = $BackgroundContent -match "function classify"
$HasListener = $BackgroundContent -match "chrome\.tabs\.onUpdated\.addListener"

if ($HasPostEvent -and $HasClassify -and $HasListener) {
    Write-Host " - OK" -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host " - FAIL" -ForegroundColor Red
    if (-not $HasPostEvent) { $ErrorsFound += "Missing postEvent function" }
    if (-not $HasClassify) { $ErrorsFound += "Missing classify function" }
    if (-not $HasListener) { $ErrorsFound += "Missing onUpdated listener" }
}

# Test 8: Check for IndexedDB code
Write-Host "Test 8: IndexedDB code present" -NoNewline
$HasIndexedDB = $BackgroundContent -match "indexedDB\.open"
if ($HasIndexedDB) {
    Write-Host " - OK" -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host " - WARNING" -ForegroundColor Yellow
    $WarningsFound += "No IndexedDB code found"
}

# Test 9: Check if console logging exists
Write-Host "Test 9: Console logging present" -NoNewline
$HasConsoleLog = $BackgroundContent -match "console\.log"
if ($HasConsoleLog) {
    Write-Host " - OK" -ForegroundColor Green
    $SuccessCount++
} else {
    Write-Host " - WARNING" -ForegroundColor Yellow
    $WarningsFound += "No console logging found"
}

# Test 10: Check file sizes
Write-Host "Test 10: File sizes look reasonable" -NoNewline
$ManifestSize = (Get-Item $ManifestPath).Length
$BackgroundSize = (Get-Item $BackgroundPath).Length
if ($ManifestSize -gt 100 -and $BackgroundSize -gt 1000) {
    Write-Host " - OK" -ForegroundColor Green
    Write-Host "   manifest: $ManifestSize bytes, background: $BackgroundSize bytes" -ForegroundColor Gray
    $SuccessCount++
} else {
    Write-Host " - WARNING" -ForegroundColor Yellow
    $WarningsFound += "File sizes seem small - manifest: $ManifestSize, background: $BackgroundSize"
}

# Summary
Write-Host ""
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================"
Write-Host "Passed: $SuccessCount"

if ($ErrorsFound.Count -gt 0) {
    Write-Host ""
    Write-Host "ERRORS ($($ErrorsFound.Count)):" -ForegroundColor Red
    foreach ($Error in $ErrorsFound) {
        Write-Host "  - $Error" -ForegroundColor Red
    }
    exit 1
}

if ($WarningsFound.Count -gt 0) {
    Write-Host ""
    Write-Host "WARNINGS ($($WarningsFound.Count)):" -ForegroundColor Yellow
    foreach ($Warning in $WarningsFound) {
        Write-Host "  - $Warning" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Extension files are valid!" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Reload extension in chrome://extensions" -ForegroundColor Cyan
Write-Host "  2. Check Service Worker console for logs" -ForegroundColor Cyan
Write-Host "  3. Visit a website and look for activity logs" -ForegroundColor Cyan
Write-Host ""
