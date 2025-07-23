@echo off
REM Firebase Development Deployment Script
REM This script deploys to the development Firebase project

echo Firebase Development Deployment
echo ===============================
echo.

echo Setting Firebase project to development...
echo ✅ Using direct project specification: ana-vaspitac-dev
echo.

echo 🚀 Starting development deployment...
echo ======================================
echo.

REM Deploy Firestore rules and indexes
echo 📝 Deploying Firestore rules and indexes...
firebase deploy --only firestore:rules,firestore:indexes --config firebase.dev.json --project ana-vaspitac-dev
if %errorlevel% neq 0 (
    echo ❌ Firestore deployment failed!
    echo Check the logs above for details.
    echo.
    pause
    exit /b 1
)
echo ✅ Firestore rules and indexes deployed successfully!

REM Deploy Storage rules
echo 📦 Deploying Storage rules...
firebase deploy --only storage --config firebase.dev.json --project ana-vaspitac-dev
if %errorlevel% neq 0 (
    echo ❌ Storage deployment failed!
    echo Check the logs above for details.
    echo.
    pause
    exit /b 1
)
echo ✅ Storage rules deployed successfully!

REM Deploy Functions if they exist
if exist "functions" (
    echo 🔧 Deploying Functions...
    cd functions
    
    echo 📦 Installing function dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install function dependencies!
        cd ..
        pause
        exit /b 1
    )
    
    echo 🔨 Building TypeScript functions...
    npm run build
    if %errorlevel% neq 0 (
        echo ❌ Function build failed!
        echo Check the build logs above for details.
        cd ..
        pause
        exit /b 1
    )
    
    cd ..
    echo 🚀 Deploying functions to development...
    firebase deploy --only functions --config firebase.dev.json --project ana-vaspitac-dev
    if %errorlevel% neq 0 (
        echo ❌ Functions deployment failed!
        echo Check the logs above for details.
        echo.
        pause
        exit /b 1
    )
    echo ✅ Functions deployed successfully!
) else (
    echo ℹ️  No functions directory found, skipping functions deployment.
)

echo.
echo ======================================
echo 🎉 Development deployment completed successfully!
echo 📊 Project: ana-vaspitac-dev
echo 🔧 Deployed: Firestore, Storage, Functions
echo 🌐 Note: Hosting is not configured (using external hosting)
echo ======================================
echo.
pause 