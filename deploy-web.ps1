$ErrorActionPreference = 'Stop'

function Get-NetlifySiteId {
  $statePath = Join-Path $PSScriptRoot '.netlify\state.json'
  if (Test-Path $statePath) {
    try {
      $state = Get-Content $statePath -Raw | ConvertFrom-Json
      if ($state.siteId) { return [string]$state.siteId }
    } catch {
      # ignore and fallback
    }
  }

  if ($env:NETLIFY_SITE_ID) { return [string]$env:NETLIFY_SITE_ID }

  throw "Netlify siteId not found. Ensure .netlify/state.json exists (from 'netlify link'), or set NETLIFY_SITE_ID."
}

$siteId = Get-NetlifySiteId

Write-Host "Building Expo web export to dist/ ..."

if (Test-Path (Join-Path $PSScriptRoot 'dist')) {
  Remove-Item -Recurse -Force (Join-Path $PSScriptRoot 'dist')
}

npm ci
if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE" }

npx expo export --platform web
if ($LASTEXITCODE -ne 0) { throw "expo export failed with exit code $LASTEXITCODE" }

Write-Host "Deploying dist/ to Netlify production site $siteId ..."

npx netlify deploy --prod --dir dist --site $siteId
if ($LASTEXITCODE -ne 0) { throw "netlify deploy failed with exit code $LASTEXITCODE" }

Write-Host "Done."
