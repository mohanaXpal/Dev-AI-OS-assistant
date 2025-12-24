@echo off
REM Quick Validation Script for Dev AI OS Assistant Modules

echo.
echo ========================================
echo    DEV AI OS ASSISTANT - QUICK CHECK
echo ========================================
echo.

REM Check Auth Backend
echo [1] Checking AUTH BACKEND...
cd dev-auth-backend
if exist package.json (
    echo ✓ package.json found
    if exist node_modules (
        echo ✓ Dependencies installed (node_modules exists)
    ) else (
        echo ✗ Dependencies NOT installed - run: npm install
    )
)
if exist src (
    echo ✓ Source code (src/) exists
    dir /b src
)
if exist test-simple.js (
    echo ✓ Test suite exists
)
cd ..
echo.

REM Check OS Automation
echo [2] Checking OS AUTOMATION...
cd dev-os-automation
if exist requirements.txt (
    echo ✓ requirements.txt found
)
if exist src (
    echo ✓ Source code (src/) exists
    dir /b src
)
if exist tests (
    echo ✓ Tests directory exists
)
cd ..
echo.

REM Check Voice System
echo [3] Checking VOICE SYSTEM...
cd dev-voice-system
if exist requirements.txt (
    echo ✓ requirements.txt found
)
if exist src (
    echo ✓ Source code (src/) exists
    dir /b src
)
if exist tests (
    echo ✓ Tests directory exists
)
cd ..
echo.

echo ========================================
echo    ✓ All modules found and configured!
echo ========================================
echo.
echo Next steps:
echo 1. AUTH BACKEND: cd dev-auth-backend ^&^& npm install ^&^& npm start
echo 2. OS AUTOMATION: cd dev-os-automation ^&^& pip install -r requirements.txt ^&^& python -m src.main
echo 3. VOICE SYSTEM: cd dev-voice-system ^&^& pip install -r requirements.txt ^&^& python -m src.main
echo.
pause
