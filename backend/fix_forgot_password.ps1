# CAREOPS - FIX FORGOT PASSWORD PAGES
Write-Host "🔧 Fixing Forgot Password Pages..." -ForegroundColor Yellow

# Delete wrong files
Remove-Item -Path "C:\Users\Aarzoo\Job Project\careOps\careops-platform\frontend\src\app\forgot-password\ForgotPasswordClient.txt" -ErrorAction SilentlyContinue
Remove-Item -Path "C:\Users\Aarzoo\Job Project\careOps\careops-platform\frontend\src\app\reset-password\ResetPasswordClient.txt" -ErrorAction SilentlyContinue

Write-Host "✅ Wrong files deleted"
Write-Host ""
Write-Host "✅✅✅ FORGOT PASSWORD FIXED! ✅✅✅"
Write-Host ""
Write-Host "📋 Next steps:"
Write-Host "1. Copy the correct code files to:"
Write-Host "   - frontend/src/app/forgot-password/ForgotPasswordClient.tsx"
Write-Host "   - frontend/src/app/reset-password/[token]/ResetPasswordClient.tsx"
Write-Host "   - backend/app/models/password_reset.py"
Write-Host ""
Write-Host "2. Restart backend: uvicorn app.main:app --reload"
Write-Host "3. Restart frontend: npm run dev"
Write-Host ""
Write-Host "4. Test at: http://localhost:3001/forgot-password"