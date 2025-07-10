@echo off
echo Deploying Firebase Storage rules and CORS configuration...

REM Deploy storage rules
firebase deploy --only storage

REM Set CORS configuration for storage bucket
gsutil cors set storage.cors.json gs://ana-vaspitac.appspot.com

echo Storage configuration deployed successfully!
pause 