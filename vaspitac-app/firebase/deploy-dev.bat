@echo off
REM Firebase Development Deployment Script
REM This script deploys to the development Firebase project

echo Firebase Development Deployment
echo ===============================
echo.

echo Setting Firebase project to development...
firebase use development
if %errorlevel% neq 0 (
    echo Failed to switch to development project.
    echo Please ensure the development project exists and you have access.
    pause
    exit /b 1
)

echo.
echo Deploying to development environment...
echo.

REM Deploy Firestore rules and indexes
echo Deploying Firestore rules and indexes...
firebase deploy --only firestore:rules,firestore:indexes --config firebase.dev.json
if %errorlevel% neq 0 (
    echo Firestore deployment failed.
    pause
    exit /b 1
)

REM Deploy Storage rules
echo Deploying Storage rules...
firebase deploy --only storage --config firebase.dev.json
if %errorlevel% neq 0 (
    echo Storage deployment failed.
    pause
    exit /b 1
)

REM Deploy Functions if they exist
if exist "functions" (
    echo Deploying Functions...
    cd functions
    echo Building TypeScript functions...
    npm run build
    if %errorlevel% neq 0 (
        echo Function build failed.
        cd ..
        pause
        exit /b 1
    )
    echo Installing function dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Failed to install function dependencies.
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo Deploying functions...
    firebase deploy --only functions --config firebase.dev.json
    if %errorlevel% neq 0 (
        echo Functions deployment failed.
        pause
        exit /b 1
    )
)

echo.
echo Development deployment completed successfully!
echo Project: ana-vaspitac-dev
echo.
pause 