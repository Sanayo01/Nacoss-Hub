# NACOS Hub: project rules
Prototype for NACOS UNILAG (computing students' association). Mock data only. It will be rebuilt and security-reviewed by volunteer developers before any real student data is used.
Stack: Next.js App Router, TypeScript, Tailwind, Prisma/SQLite (all DB access only through /lib/db), Zod validation. Theme: dark navy, mint green accent, theme tokens only.
Rules:
- Never recreate or overwrite existing work. Inspect first, then extend.
- Every API route and page checks permissions SERVER-SIDE with can(office, capability). Never trust the client.
- Every serious action goes through the approvals engine. Every state change writes an append-only AuditLog row.
- Anonymous concern senders are never exposed anywhere, to anyone, in any page, log or email.
- Finance features are record-keeping only. No payment integration, no moving money.
- No real personal data. Executives are placeholders in /config/executives.ts. Only sanayodeji087@gmail.com (General Secretary) and sanusifatih04@gmail.com (PRO) are real test addresses, with TEST_MODE on.
- No secrets in the repo; use .env only.
- After each task: run lint, type-check and tests, then list shortcuts taken.
- Keep replies short. Do not paste whole files back. Commit after each part with a clear message.

AUDIT: run the app and give me a short table of what exists (pages, API routes, Prisma models, the existing /admin passcode login) and what is broken. Do not change anything except creating CLAUDE.md.
