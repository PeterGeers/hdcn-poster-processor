param([string]$message)

# Stay in the directory where the script is located
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

if (-not (Test-Path ".git")) {
    Write-Error "Not in git repository"
    exit 1
}

Write-Host "🔍 Checking for credentials..." -ForegroundColor Yellow

$files = git diff --name-only HEAD 2>$null | Where-Object { $_ -and (Test-Path $_) }
$blocked = $false

foreach ($file in $files) {
    if ($file -like "*gitUpdate*.ps1" -or $file -like "*requirements*.txt") { continue }
    
    $content = Get-Content $file -ErrorAction SilentlyContinue
    if ($content) {
        # Check for various API key patterns
        $patterns = @(
            "sk-or-v1-[a-f0-9]{64}",  # OpenRouter keys
            "sk-[a-zA-Z0-9]{48,}",    # OpenAI keys
            "apiKey.*sk-",            # Any apiKey field with sk- value
            "OPENAI_API_KEY",         # Environment variable names
            "OPENROUTER_API_KEY"
        )
        
        foreach ($pattern in $patterns) {
            if ($content | Select-String $pattern -Quiet) {
                Write-Host "❌ BLOCKED: Potential API key in $file" -ForegroundColor Red
                $blocked = $true
                break
            }
        }
    }
}

if ($blocked) { exit 1 }

if (-not $message) { $message = "Auto commit - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" }

Write-Host "✅ Safe to commit" -ForegroundColor Green
git add .
git commit -m "$message"
git push origin main
Write-Host "✅ Done" -ForegroundColor Green