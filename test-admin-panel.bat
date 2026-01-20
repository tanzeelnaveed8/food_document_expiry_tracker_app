@echo off
REM Admin Panel Quick Test Script for Windows
REM This script tests the basic functionality of the admin panel

echo ==========================================
echo Admin Panel Quick Test Suite
echo ==========================================
echo.

set PASSED=0
set FAILED=0
set BASE_URL=http://localhost:3000

REM Check if backend is running
echo Checking if backend is running...
curl -s %BASE_URL%/api/health >nul 2>&1
if errorlevel 1 (
    echo ERROR: Backend is not running!
    echo Please start the backend server first:
    echo   cd backend
    echo   npm run start:dev
    exit /b 1
)
echo Backend is running!
echo.

REM Test 1: Health Check
echo ==========================================
echo Test Suite 1: Health Check
echo ==========================================
curl -s %BASE_URL%/api/health
if errorlevel 1 (
    echo FAIL: Health check failed
    set /a FAILED+=1
) else (
    echo PASS: Health check successful
    set /a PASSED+=1
)
echo.

REM Test 2: Admin Login
echo ==========================================
echo Test Suite 2: Authentication
echo ==========================================
echo Logging in as admin...
curl -s -X POST %BASE_URL%/api/auth/login ^
    -H "Content-Type: application/json" ^
    -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}" > temp_login.json

REM Extract token (simplified - in real scenario use jq or similar)
for /f "tokens=*" %%a in ('type temp_login.json') do set LOGIN_RESPONSE=%%a
echo Response saved to temp_login.json
echo Please check the file for the accessToken
echo.

REM Test 3: Dashboard Stats (manual token required)
echo ==========================================
echo Test Suite 3: Dashboard Statistics
echo ==========================================
echo To test dashboard stats, run:
echo curl -H "Authorization: Bearer YOUR_TOKEN" %BASE_URL%/api/admin/stats
echo.

REM Test 4: User Management
echo ==========================================
echo Test Suite 4: User Management
echo ==========================================
echo To test user management, run:
echo curl -H "Authorization: Bearer YOUR_TOKEN" %BASE_URL%/api/admin/users
echo.

REM Test 5: Broadcast Notifications
echo ==========================================
echo Test Suite 5: Broadcast Notifications
echo ==========================================
echo To test broadcast, run:
echo curl -X POST -H "Authorization: Bearer YOUR_TOKEN" ^
echo      -H "Content-Type: application/json" ^
echo      -d "{\"title\":\"Test\",\"body\":\"Test message\",\"targetAudience\":\"all\"}" ^
echo      %BASE_URL%/api/admin/notifications/broadcast
echo.

REM Summary
echo ==========================================
echo Test Summary
echo ==========================================
echo Basic connectivity tests completed
echo.
echo For complete testing:
echo 1. Extract the accessToken from temp_login.json
echo 2. Use the token in the commands shown above
echo 3. Or use the full testing guide: ADMIN_PANEL_TESTING_GUIDE.md
echo.
echo Next steps:
echo 1. Start the admin panel: cd admin ^&^& npm run dev
echo 2. Open http://localhost:3001 in your browser
echo 3. Login with: admin@example.com / admin123
echo.

del temp_login.json 2>nul
pause
