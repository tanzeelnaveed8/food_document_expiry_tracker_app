@echo off
echo ========================================
echo   Expiry Tracker Mobile - Quick Start
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Installing Expo dependencies...
call npm install expo expo-status-bar
call npx expo install expo-constants

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Install "Expo Go" app on your Android phone from Play Store
echo 2. Make sure your phone and computer are on the SAME WiFi
echo 3. This script will show a QR code
echo 4. Open Expo Go app and scan the QR code
echo.
echo Starting development server...
echo.

call npm start
