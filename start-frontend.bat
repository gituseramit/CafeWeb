@echo off
echo Starting Cyber-Cafe Frontend...
cd frontend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo Starting Vite dev server on http://localhost:3000
echo.
echo IMPORTANT: Open http://localhost:3000 in your browser (NOT the HTML file directly!)
echo.
call npm run dev
pause

