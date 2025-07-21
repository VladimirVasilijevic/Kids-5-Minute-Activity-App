@echo off
REM Firebase Production Deployment Script
REM This script deploys to the production Firebase project

echo Firebase Production Deployment
echo ==============================
echo.

echo Setting Firebase project to production...
firebase use production
if %errorlevel% neq 0 (
    echo Failed to switch to production project.
    echo Please ensure the production project exists and you have access.
    pause
    exit /b 1
)

echo.
echo WARNING: You are about to deploy to PRODUCTION!
echo This will affect live users and data.
echo.
set /p confirm="Are you sure you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo Deploying to production environment...
echo.

REM Deploy Firestore rules and indexes
echo Deploying Firestore rules and indexes...
firebase deploy --only firestore:rules,firestore:indexes --config firebase.prod.json
if %errorlevel% neq 0 (
    echo Firestore deployment failed.
    pause
    exit /b 1
)

REM Deploy Storage rules
echo Deploying Storage rules...
firebase deploy --only storage --config firebase.prod.json
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
    firebase deploy --only functions --config firebase.prod.json
    if %errorlevel% neq 0 (
        echo Functions deployment failed.
        pause
        exit /b 1
    )
)

echo.
echo Production deployment completed successfully!
echo Project: ana-vaspitac-prod
echo.
pause 