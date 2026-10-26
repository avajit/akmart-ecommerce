# =====================================================================
# AkMart Master QA Suite Runner (Host Execution)
# Saves real outputs directly to qa-reports/evidence/
# =====================================================================

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$EvidenceDir = Join-Path $PSScriptRoot "qa-reports\evidence"

if (-not (Test-Path $EvidenceDir)) {
    New-Item -ItemType Directory -Path $EvidenceDir -Force | Out-Null
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  AKMART FULL-STACK QA AND VERIFICATION SUITE RUNNER" -ForegroundColor Cyan
Write-Host "  Timestamp: $Timestamp" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Backend Unit Tests
Write-Host "[1/5] Running Unit Test Suite (Vitest)..." -ForegroundColor Yellow
$UnitLog = Join-Path $EvidenceDir "unit-test-run.log"
Push-Location "$PSScriptRoot\Backend"
try {
    npx vitest run ../tests/unit --reporter=verbose 2>&1 | Tee-Object -FilePath $UnitLog
} catch {
    Write-Host "Unit test encountered an error: $_" -ForegroundColor Red
} finally {
    Pop-Location
}
Write-Host "  Unit test logs saved to: $UnitLog" -ForegroundColor Green
Write-Host ""

# 2. API, Smoke and Regression Tests
Write-Host "[2/5] Running API, Smoke and Regression Suites..." -ForegroundColor Yellow
$ApiLog = Join-Path $EvidenceDir "api-smoke-regression-run.log"
Push-Location "$PSScriptRoot\Backend"
try {
    npx vitest run ../tests/api/smoke.test.ts ../tests/api/contract.test.ts ../tests/api/regression.test.ts --reporter=verbose 2>&1 | Tee-Object -FilePath $ApiLog
} catch {
    Write-Host "API/Regression encountered an error: $_" -ForegroundColor Red
} finally {
    Pop-Location
}
Write-Host "  API/Regression logs saved to: $ApiLog" -ForegroundColor Green
Write-Host ""

# 3. Security and RBAC Matrix Tests
Write-Host "[3/5] Running RBAC Matrix and Hostile Input Fuzzing..." -ForegroundColor Yellow
$SecLog = Join-Path $EvidenceDir "security-rbac-run.log"
Push-Location "$PSScriptRoot\Backend"
try {
    npx vitest run ../tests/api/rbac-matrix.test.ts ../tests/api/hostile-input.test.ts --reporter=verbose 2>&1 | Tee-Object -FilePath $SecLog
} catch {
    Write-Host "Security tests encountered an error: $_" -ForegroundColor Red
} finally {
    Pop-Location
}
Write-Host "  Security test logs saved to: $SecLog" -ForegroundColor Green
Write-Host ""

# 4. Dependency Security Audit (npm audit)
Write-Host "[4/5] Running npm security audit on Backend and Frontend..." -ForegroundColor Yellow
$AuditLog = Join-Path $EvidenceDir "npm-audit.log"
"--- BACKEND NPM AUDIT ---" | Out-File -FilePath $AuditLog -Encoding utf8
Push-Location "$PSScriptRoot\Backend"
try {
    npm audit 2>&1 | Out-File -FilePath $AuditLog -Append -Encoding utf8
} catch {
    "Backend audit error" | Out-File -FilePath $AuditLog -Append -Encoding utf8
} finally {
    Pop-Location
}

"`n--- FRONTEND NPM AUDIT ---" | Out-File -FilePath $AuditLog -Append -Encoding utf8
Push-Location "$PSScriptRoot\Frontend"
try {
    npm audit 2>&1 | Out-File -FilePath $AuditLog -Append -Encoding utf8
} catch {
    "Frontend audit error" | Out-File -FilePath $AuditLog -Append -Encoding utf8
} finally {
    Pop-Location
}
Write-Host "  Security audit logs saved to: $AuditLog" -ForegroundColor Green
Write-Host ""

# 5. Playwright E2E Tests
Write-Host "[5/5] Checking Playwright E2E Suites..." -ForegroundColor Yellow
$E2eLog = Join-Path $EvidenceDir "playwright-e2e.log"
try {
    npx playwright test tests/e2e 2>&1 | Tee-Object -FilePath $E2eLog
    Write-Host "  E2E logs saved to: $E2eLog" -ForegroundColor Green
} catch {
    Write-Host "  Playwright execution finished or pending browser binaries." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  AUDIT EXECUTION COMPLETE!" -ForegroundColor Green
Write-Host "  All evidence files are stored in: $EvidenceDir" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
