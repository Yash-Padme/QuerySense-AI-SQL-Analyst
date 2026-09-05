#!/bin/bash

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "Installing backend dependencies..."
cd backend
python -m pip install -r requirements.txt
cd ..

echo ""
echo "Setup complete!"
echo ""
echo "To run the application:"
echo "1. Terminal 1: cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo "2. Terminal 2: cd frontend && npm run dev"
echo ""
echo "Backend will be available at http://localhost:8000"
echo "Frontend will be available at http://localhost:3000"
