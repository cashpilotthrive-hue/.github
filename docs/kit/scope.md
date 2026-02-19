# 1️⃣ SCOPE & GLOSSARY

| Workflow | Short description | Primary services involved |
| :--- | :--- | :--- |
| User Onboarding | Registration → email/phone verification → activation. | auth-service, notification-service, audit-log, gateway |
| Know‑Your‑Customer (KYC) | Document upload → provider verification → AML screening. | kyc-service, aml-service, notification-service, audit-log |
| Funding | Deposit (card, e‑wallet, crypto) → withdrawal → segregation accounting. | payment-service, wallet-service, aml-service, audit-log |
| Betting | Odds retrieval → bet slip → placement → settlement → cash‑out. | odds-service, betting-service, wallet-service, ml-service, audit-log |
| Responsible‑Gambling Controls | Deposit/ loss limits, self‑exclusion, timeout, reality‑check, problem‑gambling detection. | compliance-service, user‑limits, self‑exclusions, reality‑checks, ml-service |
| Support & Complaints | Ticket creation, assignment, escalation, regulator‑level complaints. | customer-support-service, complaints, audit-log |
| GDPR / Data‑Subject Rights | Data export, deletion, rectification, consent withdrawal, objection. | gdpr‑requests, user-consents, audit-log |
| Regulatory Reporting | Periodic UKGC, MGA, FinCEN filings, SARs. | regulatory-reports, sar-filings, audit-log |
| Admin & Ops | Admin dashboard, user management, risk analyst UI, system health. | admin-service, monitoring, alerting |

## Cross-cutting concerns
- Zero‑access encryption (KMS‑wrapped keys, pgcrypto).
- Immutable audit trail (audit_log + QLDB).
- Event‑driven architecture (Kafka topics per domain).
- Feature‑flag gating (config/feature-flags/flags.yaml).
