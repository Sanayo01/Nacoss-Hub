# Volunteer roadmap

NACOSS Hub is a mock-data prototype. Each item is deliberately scoped for a volunteer to pick up independently. Do not use real student data until the required review and security work in [SECURITY-TODO.md](./SECURITY-TODO.md) is complete.

## Access and governance

- [ ] **AUTH-01 — Per-executive accounts:** Replace shared `ADMIN_PASSCODE` with individually provisioned accounts, strong password hashing, secure session lifecycle, recovery, and account deactivation.
- [ ] **AUTH-02 — Two-factor authentication:** Add a reviewed MFA flow and recovery codes; require MFA for privileged approvals.
- [ ] **AUTH-03 — Approval identity:** Bind approvals to authenticated people, enforce two distinct human approvers, and test delegation/acting-office periods and conflicts of interest.
- [ ] **AUTH-04 — Permission integration tests:** Exercise every page and API route as each office, including unauthenticated, missing-office, delegated, and expired-delegation cases.

## Data and operations

- [ ] **DB-01 — PostgreSQL:** Migrate SQLite schema/data and validate safe backups, migrations, restore and retention.
- [ ] **RATE-01 — Shared rate limits:** Replace process-local limits with a distributed store and test spoofed proxy headers and multi-instance behavior.
- [ ] **FILES-01 — Managed uploads:** Use private object storage, malware scanning, authorization-aware downloads, retention and backup.
- [ ] **OPS-01 — Deployment pipeline:** Add CI for lint, type checking, schema validation and tests, then document staging deployment and rollback.

## Quality and accessibility

- [ ] **TEST-01 — Handler-level coverage:** Add route integration tests for approvals, rate-limits, validation, anonymous concerns and public data projections.
- [ ] **A11Y-01 — Accessibility pass:** Test keyboard flows, focus, labels, screen readers, reduced motion and contrast against WCAG 2.2 AA.
- [ ] **UX-01 — Mobile review:** Verify the office shell and student forms at small viewport sizes and slow network conditions.

## Privacy and communication

- [ ] **PRIV-01 — Data governance:** Define lawful purpose, consent, access requests, retention/deletion, breach response and contact/ownership processes with qualified reviewers.
- [ ] **MAIL-01 — Email delivery:** Configure a transactional provider, domain authentication, delivery monitoring, templates and safe test/production separation.
- [ ] **REM-01 — Scheduled reminders:** Move meeting reminders to a durable scheduled job with idempotency and delivery audit.
