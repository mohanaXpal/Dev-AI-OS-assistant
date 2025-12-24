@echo off
REM Quick Python Environment Setup Script

echo.
echo ========================================
echo    PYTHON ENVIRONMENT SETUP
echo ========================================
echo.

REM Check if venv exists
if exist env (
    echo ✓ Virtual environment 'env' already exists
) else (
    echo Creating Python virtual environment...
    python -m venv env
    echo ✓ Virtual environment created
)

echo.
echo ========================================
echo    ACTIVATING ENVIRONMENT
echo ========================================
echo.

REM Activate virtual environment
call env\Scripts\activate.bat

echo ✓ Environment activated!
echo.
echo Current Python:
python --version

echo.
echo ========================================
echo    INSTALLING DEPENDENCIES
echo ========================================
echo.

REM Install requirements
pip install -r requirements-all.txt

echo.
echo ========================================
echo    ✓ SETUP COMPLETE!
echo ========================================
echo.
echo Your Python environment is ready!
echo.
echo Now you can run:
echo   cd apps\dev-os-automation
echo   python -m src.main
echo.
echo Or:
echo   cd apps\dev-voice-system
echo   python -m src.main
echo.
echo Press any key to continue...
pause
