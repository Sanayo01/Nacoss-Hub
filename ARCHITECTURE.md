# NACOS Hub architecture

## Scope and stack

NACOS Hub is a mock-data prototype for NACOS UNILAG computing students. It uses Next.js 14 App Router, TypeScript, Tailwind theme tokens, Prisma with SQLite, and Zod. It is not production-ready and must not store real student or executive records.

## Data and request flow

- Pages live under `app/`; route handlers live under `app/api/`.
- Prisma models are in `prisma/schema.prisma`. Application data access is centralized through `lib/db` and related service modules; UI components do not query Prisma directly.
- Validate request bodies with Zod and sanitize user-authored text at input boundaries. Public POST routes use the shared in-memory IP rate limiter in middleware.
- Office pages and API routes obtain the signed httpOnly session from `lib/admin-auth.ts` and enforce server-side capabilities from `config/permissions.ts`. Client navigation is not an authorization boundary.
- The demo login is a single shared passcode configured by `ADMIN_PASSCODE`; office selection is stored in the signed cookie. This records an office context, not an individual identity.

## Offices and capabilities

There are eleven configured offices: President, Vice President, General Secretary, Assistant General Secretary, Financial Secretary, Treasurer, Social Secretary, Sports Secretary, Welfare Secretary, Software Director, and PRO.

`config/permissions.ts` defines the capability list and `ROLE_CAPABILITIES` matrix. Pages and API handlers call `can(office, capability)` or `requireCapability()` on the server. `tests/route-permissions.test.ts` discovers executive pages and office API methods, checks for a server-side gate, and exercises the capability matrix across offices. This static sweep does not replace end-to-end route-handler tests.

| Capability area | Principal scope |
|---|---|
| Shared office work | My Day, meetings, tasks, approvals, concerns, documents, reports, notifications |
| President | Full meeting/task leadership, approvals, scorecard, motions, delegation, escalation and broadcasts |
| Vice President | Committees, coordination and delegated acting-President powers |
| General Secretary | Minutes approval, records, vault, letters, oversight, concerns, directory and scorecard |
| Assistant General Secretary | Draft minutes/letters, documents, first-pass SIWES and concern processing; publishing requires GenSec approval |
| Financial Secretary | Dues records, financial queries and reminder drafts for PRO |
| Treasurer | Ledger, budgets, receipts and expenditure review |
| Social Secretary | Event planning, volunteers, hours opt-in and reports |
| Sports Secretary | Teams, fixtures, training, equipment, signups and achievements |
| Welfare Secretary | Welfare cases, referrals, drives and wellbeing resources |
| Software Director | Student/executive platform requests, volunteers, releases and technical change requests |
| PRO | Announcement studio, content calendar, assets, coverage and copy-ready share kit |

Welfare case query access is only granted to the Welfare Secretary and President. Anonymous public submissions discard sender name/email before persistence and omit those fields from views and audit payloads.

## Approval engine

`config/approvals.ts` maps action types to required approvers, including two-key rules. `lib/approvals.ts` persists requests and decisions and runs registered handlers after approval. Two-key approval requires distinct office roles. Examples include technical role/account changes and full student-data exports. Expenditure flows through Treasurer review; amounts over the configured threshold also require President approval before recording in the ledger. Finance functions are strictly record-keeping: they do not process payments or move money.

## Audit chain

Every applicable state change appends an `AuditLog` row. The hash is SHA-256 over the previous hash plus a stable payload representation; the first row uses the chain's genesis value. There are no application update/delete operations for `AuditLog`. `verifyChain()` recomputes the links and `/office/audit` reports whether the chain is intact. Database administrators can still alter local SQLite data; production needs independently protected, externally retained logs.

## Meetings, minutes and notifications

Meetings and office RSVPs are shared across office dashboards. The Secretariat minutes flow records attendance, agenda decisions, confidentiality/shareability, and action items. Approval locks minutes, converts action items into tasks, and publishes a Decision Digest from shareable items. Notifications are in-app and may be emailed through the existing mailer subject to `TEST_MODE`. Agenda reminder delivery currently relies on the reminders endpoint/dashboard activity unless an operator schedules it.

## Files and operational limitations

Uploads are stored locally under ignored `storage/` directories and are prototype-only. In-memory rate limiting does not coordinate across instances. SQLite is local development storage. The shared passcode does not establish who an executive is, and office-level sessions cannot prove two separate human approvers. See [SECURITY-TODO.md](./SECURITY-TODO.md) before any real-data use.
