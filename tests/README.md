# AkMart Enterprise QA Test Suite

Structured test levels conforming to ISTQB & ISO/IEC 25010 standards:
- `/tests/unit`: Isolated component, service, and utility tests
- `/tests/integration`: Database, cache, and multi-service workflows
- `/tests/api`: End-to-end HTTP endpoint contracts, security, and schema validation
- `/tests/e2e`: Critical consumer & seller browser user journeys
- `/tests/performance`: Load, stress, spike, and latency tests (Artillery/k6)
- `/tests/security`: OWASP Top 10 injection, auth bypass, IDOR, and rate limiting tests
- `/tests/ui`: Visual regression, responsive breakpoints, and styling checks
- `/tests/accessibility`: WCAG 2.1 AA keyboard navigation, contrast, and ARIA audits
