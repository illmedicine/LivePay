param(
  [string]$RepoRoot = "$(Split-Path -Parent $PSScriptRoot)",
  [string]$ShortcutName = 'LivePay (Realtime).lnk'
)

$ErrorActionPreference = 'Stop'

$launcher = Join-Path $RepoRoot 'windows\\LivePay-Launch.ps1'
if (-not (Test-Path -LiteralPath $launcher)) {
  Write-Error "Launcher script not found: $launcher"
}

$programs = Join-Path $env:APPDATA 'Microsoft\\Windows\\Start Menu\\Programs'
$shortcutPath = Join-Path $programs $ShortcutName

$wsh = New-Object -ComObject WScript.Shell
$lnk = $wsh.CreateShortcut($shortcutPath)
$lnk.TargetPath = "$env:SystemRoot\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
$lnk.Arguments = "-NoProfile -ExecutionPolicy Bypass -File \"$launcher\""
$lnk.WorkingDirectory = $RepoRoot
$lnk.WindowStyle = 1
$lnk.Description = 'Start LivePay realtime demo (event server + Expo web)'
$lnk.Save()

Write-Host "Created Start Menu shortcut: $shortcutPath"
