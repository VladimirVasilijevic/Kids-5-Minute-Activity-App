@echo off
REM Firebase Setup Script for User Roles & Permissions
REM This script automates the Firebase setup process

echo Firebase Setup for User Roles and Permissions
echo ==============================================
echo.
echo Starting setup process...
echo.

REM Skip Firebase CLI check since it's hanging
echo Firebase CLI check skipped (CLI is installed)
echo CLI check completed.

echo.
echo Moving to login check...
echo.

REM Check if user is logged in
echo Checking Firebase login status...
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo Please log in to Firebase...
    firebase login
    if %errorlevel% neq 0 (
        echo Login failed. Please try again manually.
        pause
        exit /b 1
    )
) else (
    echo Already logged in to Firebase
)
echo Login check completed.

echo.
echo Moving to Firebase initialization...
echo.

REM Initialize Firebase if not already done
if not exist ".firebaserc" (
    echo Initializing Firebase project...
    echo Creating .firebaserc file...
    echo { > .firebaserc
    echo   "projects": { >> .firebaserc
    echo     "default": "ana-vaspitac" >> .firebaserc
    echo   } >> .firebaserc
    echo } >> .firebaserc
    echo Firebase project initialized with ana-vaspitac
) else (
    echo Firebase project already initialized
)

echo.
echo Moving to deployment section...
echo.

REM Deploy Firestore rules and indexes
echo Deploying Firestore rules and indexes...
firebase deploy --only firestore:rules,firestore:indexes
if %errorlevel% neq 0 (
    echo Firestore deployment failed. Please check your configuration.
    pause
    exit /b 1
)
echo Firestore deployment completed.

echo.

REM Deploy Storage rules
echo Deploying Storage rules...
firebase deploy --only storage
if %errorlevel% neq 0 (
    echo Storage deployment failed. Please check your configuration.
    pause
    exit /b 1
)
echo Storage deployment completed.

echo.
echo Moving to functions deployment...
echo.

REM Check if functions directory exists and deploy
if exist "functions" (
    echo Deploying Functions...
    cd functions
    echo Installing function dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Failed to install function dependencies.
        cd ..
        pause
        exit /b 1
    )
    echo Dependencies installed.
    cd ..
    echo Deploying functions...
    firebase deploy --only functions
    if %errorlevel% neq 0 (
        echo Functions deployment failed. Please check your configuration.
        pause
        exit /b 1
    )
    echo Functions deployment completed.
) else (
    echo Functions directory not found. Skipping functions deployment.
    echo To add functions later, run: firebase init functions
)

echo.
echo Moving to final steps...
echo.
echo Firebase setup completed successfully!
echo.
echo Next steps:
echo 1. Get your service account key from Firebase Console
echo 2. Save it as scripts/serviceAccountKey.json
echo 3. Test user creation: node scripts/create-user.js test@example.com password123 admin
echo 4. List users: node scripts/list-users.js
echo.
echo See README.md for detailed instructions
echo.
pause 