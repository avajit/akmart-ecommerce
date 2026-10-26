#!/usr/bin/env bash
# =====================================================================
# AkMart Master QA Suite Runner (Bash Edition)
# Saves real outputs directly to qa-reports/evidence/
# =====================================================================

set -e
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
EVIDENCE_DIR="qa-reports/evidence"
mkdir -p "$EVIDENCE_DIR"

echo "=========================================================="
echo "  AKMART FULL-STACK QA & VERIFICATION SUITE RUNNER"
echo "  Timestamp: $TIMESTAMP"
echo "=========================================================="
echo ""

echo "▶ [1/5] Running Unit Test Suite (Vitest)..."
(cd Backend && npx vitest run ../tests/unit --reporter=verbose) 2>&1 | tee "$EVIDENCE_DIR/unit-test-run.log" || true

echo "▶ [2/5] Running API, Smoke & Regression Suites..."
(cd Backend && npx vitest run ../tests/api/smoke.test.ts ../tests/api/contract.test.ts ../tests/api/regression.test.ts --reporter=verbose) 2>&1 | tee "$EVIDENCE_DIR/api-smoke-regression-run.log" || true

echo "▶ [3/5] Running RBAC Matrix & Hostile Input Fuzzing..."
(cd Backend && npx vitest run ../tests/api/rbac-matrix.test.ts ../tests/api/hostile-input.test.ts --reporter=verbose) 2>&1 | tee "$EVIDENCE_DIR/security-rbac-run.log" || true

echo "▶ [4/5] Running npm security audit..."
(cd Backend && npm audit) > "$EVIDENCE_DIR/npm-audit-backend.log" 2>&1 || true
(cd Frontend && npm audit) > "$EVIDENCE_DIR/npm-audit-frontend.log" 2>&1 || true

echo "▶ [5/5] Checking Playwright E2E..."
npx playwright test tests/e2e > "$EVIDENCE_DIR/playwright-e2e.log" 2>&1 || true

echo "=========================================================="
echo "  AUDIT EXECUTION COMPLETE!"
echo "  Logs saved to: $EVIDENCE_DIR"
echo "=========================================================="
