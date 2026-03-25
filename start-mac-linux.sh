#!/bin/bash
echo "======================================================"
echo " Anurag University - Auditorium Management System"
echo "======================================================"
echo ""
echo "[1/2] Installing & starting backend..."
cd backend && npm install &
sleep 2
npm start &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

sleep 3
echo ""
echo "[2/2] Installing & starting frontend..."
cd frontend && npm install && npm start &
FRONTEND_PID=$!

echo ""
echo "======================================================"
echo " Backend:  http://localhost:5000"
echo " Frontend: http://localhost:3000"
echo "======================================================"
echo ""
echo "Default Admin: admin@anurag.edu.in / admin123"
echo "Press Ctrl+C to stop all services"
wait
