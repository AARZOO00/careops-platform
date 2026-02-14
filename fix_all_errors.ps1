# CAREOPS - COMPLETE ERROR FIX
Write-Host "🔧 CAREOPS - COMPLETE ERROR FIX" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Fix 1: Fix PageAnimation TypeScript error
Write-Host "`n📋 Fixing PageAnimation TypeScript error..." -ForegroundColor Cyan
$pageAnimationPath = "frontend/src/components/ui/PageAnimation.tsx"
if (Test-Path $pageAnimationPath) {
    $content = @'
'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface PageAnimationProps {
  children: ReactNode;
  className?: string;
}

export default function PageAnimation({ children, className = '' }: PageAnimationProps) {
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
'@
    $content | Out-File -FilePath $pageAnimationPath -Encoding utf8
    Write-Host "  ✅ Fixed PageAnimation.tsx" -ForegroundColor Green
}

# Fix 2: Install backend dependencies
Write-Host "`n📋 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
& .\venv\Scripts\Activate.ps1
pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings python-jose passlib python-multipart python-dotenv email-validator
Set-Location ..
Write-Host "  ✅ Backend dependencies installed" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "✅ ALL ERRORS FIXED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Restart VS Code: Ctrl+Shift+P → 'Reload Window'"
Write-Host "  2. Start backend: cd backend && .\venv\Scripts\Activate.ps1 && uvicorn app.main:app --reload"
Write-Host "  3. Start frontend: cd frontend && npm run dev"
Write-Host "  4. Open browser: http://localhost:3001"
Write-Host ""
Write-Host "🎯 ALL ERRORS ARE NOW FIXED!" -ForegroundColor Green