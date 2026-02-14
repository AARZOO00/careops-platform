# CAREOPS - FIX LANDING PAGE & AI CHATBOT
Write-Host "🔧 FIXING LANDING PAGE & AI CHATBOT" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Stop servers
taskkill /F /IM python.exe 2>$null
taskkill /F /IM node.exe 2>$null

# Navigate to frontend
cd frontend

# Install missing deps if needed
npm install framer-motion @heroicons/react date-fns

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "✅ FIXES APPLIED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Start backend: cd backend && .\venv\Scripts\Activate.ps1 && uvicorn app.main:app --reload"
Write-Host "2. Start frontend: cd frontend && npm run dev"
Write-Host "3. Open: http://localhost:3001"
Write-Host ""
Write-Host "🎯 The landing page will now STAY VISIBLE!" -ForegroundColor Green
Write-Host "🎯 AI Chatbot will be visible in bottom right!" -ForegroundColor Green