# CAREOPS - COMPLETE FRONTEND SETUP
Write-Host "🔧 Setting up CareOps Frontend..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Navigate to frontend
Set-Location "C:\Users\Aarzoo\Job Project\careOps\careops-platform\frontend"

# Install core dependencies
Write-Host "`n📦 Installing core dependencies..." -ForegroundColor Cyan
npm install next@14.0.4 react@18.2.0 react-dom@18.2.0
npm install typescript@5.3.3
npm install @headlessui/react@1.7.17 @heroicons/react@2.0.18
npm install @tanstack/react-query@5.12.2
npm install axios@1.6.2

# Install form handling
Write-Host "`n📦 Installing form handling..." -ForegroundColor Cyan
npm install react-hook-form@7.48.2
npm install @hookform/resolvers@3.3.4
npm install zod@3.22.4

# Install UI and animations
Write-Host "`n📦 Installing UI and animations..." -ForegroundColor Cyan
npm install framer-motion@11.0.3
npm install date-fns@3.3.1
npm install react-hot-toast@2.4.1

# Install state management
Write-Host "`n📦 Installing state management..." -ForegroundColor Cyan
npm install zustand@4.4.7

# Install Tailwind CSS
Write-Host "`n📦 Installing Tailwind CSS..." -ForegroundColor Cyan
npm install -D tailwindcss@3.3.6 postcss@8.4.32 autoprefixer@10.4.16 @tailwindcss/forms@0.5.7

# Install dev dependencies
Write-Host "`n📦 Installing dev dependencies..." -ForegroundColor Cyan
npm install -D @types/node@20.10.5 @types/react@18.2.45 @types/react-dom@18.2.18
npm install -D eslint@8.56.0 eslint-config-next@14.0.4

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "✅ FRONTEND SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "`n🌐 Open: http://localhost:3001" -ForegroundColor White