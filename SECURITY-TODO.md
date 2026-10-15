# Security TODO before any real-data use

**Current status: prototype only.** Do not import real student, alumni, executive, welfare, financial, or conduct information until every applicable item below has been reviewed and signed off by NACOS leadership and qualified security/privacy reviewers.

## Identity and permissions

- [ ] Replace shared demo passcode and office selection with individual, verified executive accounts and role lifecycle management.
- [ ] Add MFA, secure password recovery, session revocation, expiration controls, and login/approval monitoring.
- [ ] Enforce authorization for every server-rendered page, route handler, download and background job. Add end-to-end allow/deny tests for every office and unauthenticated states.
- [ ] Bind approval decisions to human identities; prevent self-approval and enforce two distinct people for two-key actions.
- [ ] Review temporary delegation/cover modes, expiration, revocation, and audit records.

## Data protection and privacy

- [ ] Complete a privacy impact assessment and obtain legal/privacy review for applicable Nigerian data protection requirements.
- [ ] Define data controller/processor responsibilities, lawful purposes, notices, consent, retention, deletion, access requests and incident response.
- [ ] Inventory each database field and remove unnecessary personal/sensitive data. Define a retention policy for concerns, welfare cases, financial records, uploaded files and logs.
- [ ] Verify anonymous submissions cannot be linked to identity through stored fields, logs, email, analytics, backups, exports, notifications or timing metadata. Do not promise anonymity until this is independently reviewed.
- [ ] Review Welfare case access, need-to-know practices, emergency escalation, retention and download/export behavior.
- [ ] Test public API projections and CSV exports to ensure they expose only specifically approved data.

## Application and infrastructure

- [ ] Run independent threat modeling, source review, dependency scanning, penetration testing and remediation before deployment.
- [ ] Replace local SQLite with managed PostgreSQL, use least-privilege database credentials, encrypt transport/storage, and rehearse backup/restore.
- [ ] Replace process-local rate limiting with a distributed limiter. Review trusted proxy configuration and ensure clients cannot evade limits by spoofing forwarding headers.
- [ ] Review Zod schemas and sanitization at every input boundary; add contextual output encoding and rich-text policy where needed.
- [ ] Store uploads in private managed storage; add malware scanning, authorization-aware access, content-type verification, retention and backups.
- [ ] Review all security headers, cookies, CSRF protections, CORS, CSP, error responses and Next.js production configuration.
- [ ] Configure external immutable audit retention and alerting. The local SQLite hash chain alone cannot resist a database administrator altering/rebuilding the database.
- [ ] Add production monitoring, alert response, secrets rotation, incident procedures and tested rollback.

## Secrets, email and prototype limits

- [ ] Provision `ADMIN_PASSCODE`, `ADMIN_SESSION_SECRET`, database credentials and mail credentials via a production secret manager. `.env` must remain private; never commit secrets.
- [ ] Remove legacy demo credential/signing-fallback literals from the existing Git history using a coordinated history-cleanup before sharing, and rotate any values that may have been reused. Current source and `.env.example` no longer contain the identified literals; the baseline commits still do.
- [ ] Keep `TEST_MODE=true` and use non-sensitive test destinations in development. Review mailer routing before enabling production mail.
- [ ] Do not use the shared demo office session to claim two independent approvers; office selection is not individual identity proof.
- [ ] Keep finance record-only: do not connect payment processing or represent the ledger as proof that money moved.

## Prototype implementation limitations

- Shared passcode authenticates the demo, not a named executive.
- Rate limits are memory-local and reset on restart.
- SQLite and uploaded files are local prototype storage, not durable or backed up.
- The audit hash chain detects ordinary row edits but is not externally anchored.
- Browser print-to-PDF is not a signed or tamper-proof document.
- Test and workflow coverage does not substitute for independent security review or end-to-end production testing.
- The existing Git history contains legacy demo passcode and session-signing fallback literals in older commits. They are absent from the current source tree; treat them as exposed, rotate local values, and coordinate history cleanup before publishing or sharing this repository. The history was not rewritten as part of this task.
