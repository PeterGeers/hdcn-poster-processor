@echo off
echo 🔄 Git Update Script - HDCN Poster Processor
echo ============================================
echo.

echo 📊 Checking git status...
git status
echo.

echo 📝 Adding all changes...
git add .
echo.

echo 💬 Committing changes...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message=Update HDCN Poster Processor

git commit -m "%commit_message%"
echo.

echo 🚀 Pushing to remote repository...
git push
echo.

echo ✅ Git update completed!
echo.
pause