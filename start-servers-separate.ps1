# Start HDCN Poster Processor - Frontend en Backend in aparte vensters

Write-Host "🚀 Starting HDCN Poster Processor servers in separate windows..." -ForegroundColor Green

# Start Backend in nieuw PowerShell venster
Write-Host "📡 Starting Backend server (port 3002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\Backend'; npm run dev"

# Wacht even voordat frontend start
Start-Sleep -Seconds 2

# Start Frontend in nieuw PowerShell venster  
Write-Host "🌐 Starting Frontend server (port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\Frontend'; npm run dev"

Write-Host "✅ Both servers starting in separate windows!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "🔧 Backend: http://localhost:3002" -ForegroundColor White
Write-Host "" 
Write-Host "💡 Close the PowerShell windows to stop the servers" -ForegroundColor Gray