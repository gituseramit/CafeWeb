@echo off
echo Starting Cyber-Cafe Backend Server...
cd backend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo Starting server on http://localhost:5000
call npm run dev
pause

