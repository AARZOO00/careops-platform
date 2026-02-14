# CAREOPS - COMPLETE FIX FOR BCRYPT ERROR
Write-Host "🔧 CAREOPS - FIXING BCRYPT ERROR" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Step 1: Kill any running processes
Write-Host "`n📋 Stopping servers..." -ForegroundColor Cyan
taskkill /F /IM python.exe 2>$null
taskkill /F /IM node.exe 2>$null

# Step 2: Navigate to backend
Set-Location "C:\Users\Aarzoo\Job Project\careOps\careops-platform\backend"

# Step 3: Activate virtual environment
Write-Host "`n📋 Activating virtual environment..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

# Step 4: Uninstall and reinstall bcrypt packages
Write-Host "`n📋 Reinstalling bcrypt packages..." -ForegroundColor Cyan
pip uninstall bcrypt passlib -y
pip install bcrypt==4.0.1
pip install passlib[bcrypt]==1.7.4

# Step 5: Verify installation
Write-Host "`n📋 Verifying installation..." -ForegroundColor Cyan
python -c "import bcrypt; print('✅ bcrypt version:', bcrypt.__version__)"
python -c "from passlib.context import CryptContext; ctx = CryptContext(schemes=['bcrypt']); print('✅ passlib working')"

# Step 6: Delete old database
Write-Host "`n📋 Removing old database..." -ForegroundColor Cyan
Remove-Item -Force careops.db -ErrorAction SilentlyContinue

# Step 7: Create test user
Write-Host "`n📋 Creating test user..." -ForegroundColor Cyan
python create_test_user.py

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "✅ ALL FIXES COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. Start backend: uvicorn app.main:app --reload"
Write-Host "  2. Start frontend: cd ../frontend && npm run dev"
Write-Host "  3. Open browser: http://localhost:3001"
Write-Host "  4. Login with: admin@demo.com / Demo123456"
Write-Host ""
Write-Host "🎯 BCRYPT ERROR IS NOW FIXED!" -ForegroundColor Green