# FIX: Next.js 14+ Viewport warnings
Write-Host "🔧 Fixing Next.js 14+ Viewport warnings..." -ForegroundColor Yellow

$layoutPath = "frontend/src/app/layout.tsx"

if (Test-Path $layoutPath) {
    $content = Get-Content $layoutPath -Raw
    
    # Fix imports
    if ($content -notmatch "import type { Metadata, Viewport }") {
        $content = $content -replace "import type { Metadata }", "import type { Metadata, Viewport }"
    }
    
    # Add viewport export if missing
    if ($content -notmatch "export const viewport: Viewport") {
        $viewportExport = @"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e3a8a' },
  ],
  colorScheme: 'light dark',
}
"@
        $content = $content -replace "(export const metadata: Metadata = {)", "$viewportExport`n`n`$1"
    }
    
    # Remove viewport from metadata
    $content = $content -replace "viewport:.*?\n", ""
    
    Set-Content $layoutPath $content
    Write-Host "✅ Fixed: $layoutPath" -ForegroundColor Green
}

# Fix register page
$registerPath = "frontend/src/app/register/page.tsx"
if (Test-Path $registerPath) {
    $content = Get-Content $registerPath -Raw
    if ($content -notmatch "import type .* Viewport") {
        $content = "import type { Metadata, Viewport } from 'next'`n" + $content
        $content = $content -replace "export const metadata: Metadata = {", "export const viewport: Viewport = {`n  width: 'device-width',`n  initialScale: 1,`n}`n`nexport const metadata: Metadata = {"
        Set-Content $registerPath $content
        Write-Host "✅ Fixed: $registerPath" -ForegroundColor Green
    }
}

# Fix login page
$loginPath = "frontend/src/app/login/page.tsx"
if (Test-Path $loginPath) {
    $content = Get-Content $loginPath -Raw
    if ($content -notmatch "import type .* Viewport") {
        $content = "import type { Metadata, Viewport } from 'next'`n" + $content
        $content = $content -replace "export const metadata: Metadata = {", "export const viewport: Viewport = {`n  width: 'device-width',`n  initialScale: 1,`n}`n`nexport const metadata: Metadata = {"
        Set-Content $loginPath $content
        Write-Host "✅ Fixed: $loginPath" -ForegroundColor Green
    }
}

# Set port to 3001
$packagePath = "frontend/package.json"
if (Test-Path $packagePath) {
    $content = Get-Content $packagePath -Raw
    if ($content -notmatch "next dev -p 3001") {
        $content = $content -replace '"dev": "next dev"', '"dev": "next dev -p 3001"'
        Set-Content $packagePath $content
        Write-Host "✅ Set default port to 3001" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 FIX COMPLETE!" -ForegroundColor Green
Write-Host "1. Restart your frontend: cd frontend; npm run dev" -ForegroundColor Cyan
Write-Host "2. Open: http://localhost:3001" -ForegroundColor Cyan
Write-Host "3. The viewport warnings are GONE!" -ForegroundColor Green