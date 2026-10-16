# NACOS Hub

NACOS Hub is a mock-data prototype for NACOS UNILAG computing students. It demonstrates student services and executive-office workflows; it is not approved for real student data. Volunteer developers must review and rebuild production authentication, authorization, privacy, storage, and operational controls before real use. Use the floating theme control to switch between dark and light modes; the preference is saved in this browser.

## Run locally

Requirements: Node.js and npm.

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` before starting. Set a private `ADMIN_PASSCODE`, a unique random `ADMIN_SESSION_SECRET` of at least 32 characters, `DATABASE_URL="file:./dev.db"` and `TEST_MODE=true`. Keep `.env` private and never commit it. Then run:

```powershell
npx prisma db push
npx prisma generate
npm run dev
```

Open <http://localhost:3000>. Sign in at `/admin` with the locally configured passcode, select an office, and use the `/office` workspace. The login is shared demo access, not individual executive identity. Do not use it with real information.

Useful checks:

```powershell
npm run lint
npx tsc --noEmit
npm test
```

Do not run `prisma db push --force-reset` or the seed script against a database containing work you need to keep. The seed script can delete existing sample records; inspect it and back up the database first.

## Student-facing pages

The student prototype includes the home page, executive directory, routed concerns and tracking, calendar, events, announcements, documents, finance summary, sports, welfare resources, SIWES/alumni, platform requests, pulse polls, and handbook. Public data and submissions must remain mock/demo data.

## Executive workspaces

All 11 offices use the shared signed-cookie office selection and capability-gated `/office` shell:

| Office | Example workspace |
|---|---|
| President | `/office/president` |
| Vice President | `/office/vice-president` |
| General Secretary | `/office/secretariat` |
| Assistant General Secretary | `/office/secretariat` |
| Financial Secretary | `/office/financial-secretary` |
| Treasurer | `/office/treasurer` |
| Social Secretary | `/office/social` |
| Sports Secretary | `/office/sports` |
| Welfare Secretary | `/office/welfare` |
| Software Director | `/office/software` |
| PRO | `/office/pro` |

Shared workflows include meetings and RSVPs, tasks, approvals, concerns, documents, reports, notifications, and audited state changes. President, Vice President, and General Secretary can inspect `/office/audit`. Minutes approval creates action-item tasks and a shareable Decision Digest. Delegations are time-bounded and recorded.

Office-specific capabilities cover presidential leadership and motions; VP committees and coordination; Secretariat minutes, vault, letters, oversight, records and moderation; Financial Secretary dues and queries; Treasurer record-only ledger, budgets and expenditure approvals; Social Secretary events and opt-in volunteer hours; Sports teams and fixtures; Welfare cases/resources; Software Director requests/roster/releases; and PRO announcements/assets. Welfare case records are visible only to the Welfare Secretary and President. Anonymous sender identity is discarded and excluded from office views.

## Approvals, finance, audit and files

Serious actions use `config/approvals.ts`. Some actions require two different offices, including technical role changes and full student-data exports. Expenditure requests are record-keeping only: the Treasurer reviews; amounts above the configured `TREASURER_SPENDING_APPROVAL_LIMIT` (default 50,000) also require President approval. No payment processor or money movement is provided.

State-changing operations append to an SHA-256-linked audit chain; `/office/audit` verifies the chain. The design prevents application update/delete paths but is not a substitute for a tamper-resistant external log store.

Prototype uploads use local ignored `storage/` folders. They are not backed up or suitable for confidential/real records. WhatsApp content is copy-ready only; there is no auto-posting. PDF output uses browser print-to-PDF, not cryptographically signed documents.

Public POST rate limiting is in-memory and resets on restart; it is not distributed across instances. `TEST_MODE` defaults to safe redirection for configured mock office addresses. Do not disable it without reviewing the mailer configuration.

## Project documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — data flow, offices, capabilities, approvals and audit.
- [ROADMAP.md](./ROADMAP.md) — volunteer-sized follow-up tasks.
- [SECURITY-TODO.md](./SECURITY-TODO.md) — checks required before real data.
