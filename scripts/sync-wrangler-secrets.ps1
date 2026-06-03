# Sync .env.local keys to Cloudflare Worker secrets (newedu). Does not print values.
param(
  [string]$EnvFile = ".env.local",
  [string]$Extra = ""
)

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if ($Extra) {
  Add-Content -Path $EnvFile -Value $Extra -Encoding utf8
}

Get-Content $EnvFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) { return }
  $idx = $line.IndexOf("=")
  if ($idx -lt 1) { return }
  $name = $line.Substring(0, $idx).Trim()
  $value = $line.Substring($idx + 1).Trim()
  if (-not $name) { return }
  Write-Host "Setting secret: $name"
  $value | pnpm exec wrangler secret put $name 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to set secret: $name"
  }
}

Write-Host "Done. Redeploy if needed: pnpm run deploy"
