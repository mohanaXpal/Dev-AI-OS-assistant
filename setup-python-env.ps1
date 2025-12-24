# Python Environment Setup Script (PowerShell)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    PYTHON ENVIRONMENT SETUP" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if venv exists
if (Test-Path "env") {
    Write-Host "✓ Virtual environment 'env' already exists" -ForegroundColor Green
} else {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv env
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    ACTIVATING ENVIRONMENT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Activate virtual environment
& .\env\Scripts\Activate.ps1

Write-Host "✓ Environment activated!" -ForegroundColor Green
Write-Host ""
Write-Host "Current Python:" -ForegroundColor Yellow
python --version

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    INSTALLING DEPENDENCIES" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Install requirements
pip install -r requirements-all.txt

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    ✓ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Python environment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Now you can run:" -ForegroundColor Yellow
Write-Host "  cd apps\dev-os-automation" -ForegroundColor Cyan
Write-Host "  python -m src.main" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or:" -ForegroundColor Yellow
Write-Host "  cd apps\dev-voice-system" -ForegroundColor Cyan
Write-Host "  python -m src.main" -ForegroundColor Cyan
Write-Host ""
