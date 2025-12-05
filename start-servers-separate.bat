@echo off
echo 🚀 Starting HDCN Poster Processor servers in separate windows...

echo 📡 Starting Backend server (port 3002)...
start "HDCN Backend" powershell -NoExit -Command "cd '%~dp0Backend'; npm run dev"

timeout /t 2 /nobreak >nul

echo 🌐 Starting Frontend server (port 5173)...
start "HDCN Frontend" powershell -NoExit -Command "cd '%~dp0Frontend'; npm run dev"

echo ✅ Both servers starting in separate windows!
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:3002
echo.
echo 💡 Close the PowerShell windows to stop the servers
pause