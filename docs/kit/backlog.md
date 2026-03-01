# 2️⃣ EPIC & STORY TEMPLATES

**Epic:** Social → <X>

**Goal:** Enable users to <brief business purpose> while meeting all regulatory, security, and usability requirements.

**Acceptance Criteria** (high-level)
1. The end‑to‑end user journey completes successfully under normal conditions.
2. All personal data is encrypted at rest and in transit.
3. Every state change generates an immutable audit‑log entry.
4. The flow respects the applicable SLA (e.g., ≤ 5 s latency, ≥ 99.5 % success).
5. The flow is covered by unit, contract, integration, and E2E tests with ≥ 80 % coverage.
6. All required compliance checks (AML, GDPR, responsible‑gambling) are performed automatically.
7. Errors are presented to the user with clear, non‑technical messages and a fallback path.

**Definition of Done**
- ✅ Code merged to `main` with peer review.
- ✅ OpenAPI spec updated and contract tests passing.
- ✅ Terraform/Helm changes applied to `staging`.
- ✅ All new metrics exposed and dashboards updated.
- ✅ Runbook added to Confluence.
- ✅ Security scan (Snyk, OWASP ZAP) clean.
- ✅ Documentation (user guide, API docs) published.
