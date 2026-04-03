<#
PowerShell helper to change to project directory, install deps if needed, set env vars, and start the server.
Usage:
  Open PowerShell and run:
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
    .\start.ps1
Or provide the project path:
    .\start.ps1 -ProjectPath 'D:\Minipj (3)\Minipj (2)\Minipj'
#>
param(
    [string]$ProjectPath = 'D:\Minipj (3)\Minipj (2)\Minipj'
)

try {
    if (-not (Test-Path $ProjectPath)) {
        Write-Error "Project path not found: $ProjectPath"
        return
    }

    Set-Location $ProjectPath
    Write-Host "Location: $(Get-Location)"

    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing npm dependencies..."
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm install failed (exit code $LASTEXITCODE)"
            return
        }
    }

    # Set recommended env vars for the session (change secrets before production)
    $env:MONGODB_URI = 'mongodb://127.0.0.1:27017/nutriscan_db'
    $env:SESSION_SECRET = 'change-me-to-a-strong-secret'

    Write-Host "Starting NutriScan (npm start)..."
    npm start
} catch {
    Write-Error "Error running start.ps1: $_"
}
