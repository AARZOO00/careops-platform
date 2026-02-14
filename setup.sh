#!/bin/bash

echo "🚀 Setting up CareOps Unified Platform"
echo "========================================"

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

cd ..

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd frontend

# Install dependencies
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  Backend:  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access the application at: http://localhost:3000"
echo "📚 API Documentation at: http://localhost:8000/docs"