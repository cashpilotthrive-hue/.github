# 3️⃣ FEATURE-BREAKDOWN MATRICES

## 3.1 Support & Complaints
| Ticket ID | Title | Owner | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| SUP‑001 | Front‑end “Create Ticket” UI | FE‑Lead | UI | Build HelpCenter page, ticket form, attachment uploader (max 5 MB). |
| SUP‑002 | Support Service – POST /support/ticket | BE‑Support | API | Validate payload, store in support_tickets, emit support.ticket.created Kafka event. |
| SUP‑003 | Ticket Assignment Logic (auto‑routing) | BE‑Support | Service | Assign tickets based on category and priority to the least‑busy agent (SQL query). |
| SUP‑004 | Agent UI – ticket list & messaging | FE‑Admin | UI | Build admin dashboard view, real‑time updates via WebSocket (/ws/tickets). |
| SUP‑005 | Notification Service – ticket updates | BE‑Notify | Service | Email/SMS templates for “Ticket Received”, “Agent Reply”, “Ticket Closed”. |
| SUP‑006 | Complaint Entity – regulated flow | BE‑Complaints | API | POST /complaints stores in complaints, calculates response_due_date (8 weeks). |
| SUP‑007 | Audit‑Log entries for all ticket actions | BE‑Audit | Infra | Hook into support_tickets triggers to write event_type=support_ticket_*. |
| SUP‑008 | Unit & contract tests for support APIs | QA | Test | Pact contracts, Jest unit tests. |
| SUP‑009 | End‑to‑end Cypress test: submit ticket → agent reply → close | QA | E2E | Simulate two users (customer & agent). |
| SUP‑010 | Monitoring – ticket backlog gauge | Ops | Monitoring | CloudWatch metric SupportTicketsOpen, alert if > 200. |
| SUP‑011 | Runbook – ticket escalation to regulator | Ops | Docs | Steps for moving a complaint to escalated_to_regulator = true. |

## 3.2 GDPR / Data-Subject Rights
| Ticket ID | Title | Owner | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| GDPR‑001 | Front‑end “Data‑Privacy Center” page | FE‑Lead | UI | Show current consents, buttons for export, deletion, rectification. |
| GDPR‑002 | API – POST /gdpr/request | BE‑GDPR | API | Accept request_type enum, create row in gdpr_requests, set due_date. |
| GDPR‑003 | Export Worker – generate CSV/JSON dump | BE‑GDPR | Worker | Query all user‑related tables, write encrypted file to S3, store path in gdpr_requests.export_file_path. |
| GDPR‑004 | Deletion Worker – hard delete PII | BE‑GDPR | Worker | Remove rows from users, kyc_documents, payment_methods (except required audit logs). |
| GDPR‑005 | Consent Management API – PATCH /consents/{id} | BE‑GDPR | API | Update user_consents (withdrawn_at, consented=false). |
| GDPR‑006 | Audit‑Log hook for GDPR actions | BE‑Audit | Infra | Write event_type=data_export / data_deletion with hash chain. |
| GDPR‑007 | Notification Service – GDPR completion email | BE‑Notify | Service | Email user with secure download link (expires after 48 h). |
| GDPR‑008 | Unit & contract tests for GDPR endpoints | QA | Test | Pact contracts, Jest tests for edge cases (invalid request_id). |
| GDPR‑009 | End‑to‑end Cypress test: request export → download → verify file | QA | E2E | Use test user with known data. |
| GDPR‑010 | Monitoring – pending GDPR requests gauge | Ops | Monitoring | CloudWatch metric GDPRRequestsPending; alert if > 10 for > 24 h. |
| GDPR‑011 | Runbook – GDPR breach response | Ops | Docs | Steps to revoke access, notify DPO, log in audit. |
