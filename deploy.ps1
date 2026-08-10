param(
  [string]$Message = ""
)

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "  AURUM - Deploy to GitHub Pages" -ForegroundColor Cyan
Write-Host "  ==============================" -ForegroundColor Cyan

git add -A
if ($LASTEXITCODE -ne 0) { throw "git add failed" }

$diff = git diff --cached --stat
if (-not $diff) {
  Write-Host "  Nothing to commit - working tree clean." -ForegroundColor Yellow
} else {
  $commitMsg = $Message
  if (-not $commitMsg) { $commitMsg = "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }
  git commit -m $commitMsg
  if ($LASTEXITCODE -ne 0) { throw "git commit failed" }
  Write-Host "  Committed: $commitMsg" -ForegroundColor Green
}

git push origin main
if ($LASTEXITCODE -ne 0) { throw "git push failed" }
Write-Host "  Pushed to origin/main." -ForegroundColor Green

$remote = git config --get remote.origin.url
if ($remote -match 'github\.com[:\/]([^\/]+)\/([^\/\.]+)') {
  $user = $matches[1]
  $repo = $matches[2]
  Write-Host ""
  Write-Host "  Done. Site will be live at:" -ForegroundColor Cyan
  Write-Host "  https://$user.github.io/$repo/" -ForegroundColor White
} else {
  Write-Host "  Pushed. (Could not parse remote for Pages URL.)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Note: enable GitHub Pages first if not already on:" -ForegroundColor DarkYellow
Write-Host "        Repo > Settings > Pages > Source: Deploy from a branch > main / (root)" -ForegroundColor DarkYellow
Write-Host ""
