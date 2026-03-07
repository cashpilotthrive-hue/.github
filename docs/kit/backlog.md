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

# 3️⃣ AAFS EPIC & STORIES (NEW)

**Epic:** AAFS → Foundation

**Goal:** Establish the foundational infrastructure for the Advanced Autonomous Financial System (AAFS) including ethical decision-making, ledger integration, and autonomous engine skeletons.

**Acceptance Criteria**
1. System directory structure is established (`aafs/`).
2. Ethical and Theological Guidelines are documented and integrated into the AI Engine's logic.
3. A skeleton AI Engine service exists with a basic ethical evaluation endpoint.
4. A Blockchain Ledger service exists for immutable transaction recording.
5. All AAFS components are covered by unit tests.

| Story ID | Title | Owner | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| AAFS‑001 | Initial Directory & Docs | Architect | Infra | Setup `aafs/` structure, `VISION.md`, and `ETHICAL_GUIDELINES.md`. |
| AAFS‑002 | AI Engine – POST /evaluate | AI‑Dev | API | Develop service to assess investment proposals against ethical rules. |
| AAFS‑003 | Ledger Service – POST /record | Ledger‑Dev | API | Develop service for immutable recording of AAFS transactions. |
| AAFS‑004 | Ethical Framework Unit Tests | QA | Test | Verify AI Engine logic with positive and negative ethical scenarios. |
