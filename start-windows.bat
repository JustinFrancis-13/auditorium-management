@echo off
echo ====================================================
echo  Anurag University - Auditorium Management System
echo ====================================================
echo.
echo [1/2] Starting Backend...
start "SAMS Backend" cmd /k "cd backend && npm install && npm start"
timeout /t 4
echo.
echo [2/2] Starting Frontend...
start "SAMS Frontend" cmd /k "cd frontend && npm install && npm start"
echo.
echo ====================================================
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:3000
echo ====================================================
echo.
echo Make sure MongoDB is running before proceeding!
echo Default Admin: admin@anurag.edu.in / admin123
echo.
pause
