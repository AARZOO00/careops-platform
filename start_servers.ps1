# CAREOPS - START ALL SERVERS
Write-Host "🚀 Starting CareOps Servers..." -ForegroundColor Yellow

# Kill any existing processes
taskkill /F /IM python.exe 2>$null
taskkill /F /IM node.exe 2>$null

# Start Backend (new window)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Aarzoo\Job Project\careOps\careops-platform\backend'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Frontend (new window)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Aarzoo\Job Project\careOps\careops-platform\frontend'; npm run dev"

Write-Host "✅ Servers starting..."
Write-Host "📱 Frontend: http://localhost:3001"
Write-Host "🔧 Backend: http://localhost:8000"