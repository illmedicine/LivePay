param(
  [switch]$OpenBrowser = $true,
  [string]$RepoRoot = "$(Split-Path -Parent $PSScriptRoot)"
)

$ErrorActionPreference = 'Stop'

$envScript = Join-Path $PSScriptRoot '.env.ps1'
if (Test-Path -LiteralPath $envScript) {
  . $envScript
}

function Start-LivePayProcess {
  param(
    [Parameter(Mandatory=$true)][string]$Title,
    [Parameter(Mandatory=$true)][string]$Command
  )

  Start-Process -FilePath "powershell.exe" -ArgumentList @(
    '-NoProfile',
    '-NoExit',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    "`$Host.UI.RawUI.WindowTitle = '${Title}'; if (Test-Path -LiteralPath '${envScript}') { . '${envScript}' }; Set-Location -LiteralPath '${RepoRoot}'; ${Command}"
  ) -WorkingDirectory $RepoRoot | Out-Null
}

if (-not (Test-Path -LiteralPath $RepoRoot)) {
  Write-Error "RepoRoot not found: $RepoRoot"
}

Start-LivePayProcess -Title 'LivePay Events' -Command 'npm run events'
Start-Sleep -Milliseconds 600
Start-LivePayProcess -Title 'LivePay Web' -Command 'npm run web'

if ($OpenBrowser) {
  Start-Sleep -Seconds 2
  try {
    Start-Process "http://localhost:8081"
  } catch {
    # ignore
  }
}

Write-Host "LivePay started. If OAuth is configured, open http://localhost:4317/oauth/google/start"
