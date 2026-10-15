# NACOS Hub Production Roadmap

This document outlines the prioritized work items required before transitioning NACOS Hub from a pitch prototype into a production service for the entire student body.

---

## 🚦 Phase 1: Authentication & Access Control (Priority 1)

- [ ] **`AUTH-01` Per-Executive Accounts & Passwords**
  - Replace the shared `ADMIN_PASSCODE` with an `ExecutiveAccount` model.
  - Implement bcrypt/argon2 password hashing.
  - Add session management via NextAuth.js or Iron Session with HTTP-only cookies.
- [ ] **`AUTH-02` Role-Based Access Control (RBAC)**
  - Restrict executive actions so an executive can only edit concerns routed to their office, while the President and General Secretary retain super-admin audit rights.
- [ ] **`AUTH-03` Two-Factor Authentication (2FA)**
  - Integrate TOTP (Google Authenticator) for executive logins.

---

## 🗄️ Phase 2: Database Migration & Infrastructure (Priority 2)

- [ ] **`DB-01` PostgreSQL Migration**
  - Migrate Prisma schema provider from `sqlite` to `postgresql`.
  - Provision managed PostgreSQL on Supabase or Neon.
  - Enable connection pooling with PgBouncer.
- [ ] **`DB-02` Redis Distributed Rate Limiting**
  - Replace in-memory `Map` rate limiter with Upstash Redis (`@upstash/ratelimit`).
  - Enforce global rate limiting across serverless instances.
- [ ] **`INFRA-01` Dockerization & Production CI/CD**
  - Write multi-stage `Dockerfile`.
  - Add GitHub Actions CI workflow for linting, type-checking, and build verification.

---

## 📧 Phase 3: Communication & Notification Upgrades (Priority 3)

- [ ] **`NOTIF-01` Production Email Delivery**
  - Migrate Nodemailer to transactional email providers (Resend, Postmark, or SendGrid).
  - Add SPF, DKIM, and DMARC DNS records for `nacos-unilag.org`.
- [ ] **`NOTIF-02` Executive Digest Email**
  - Build a daily cron job that aggregates unresolved student concerns and emails an executive summary every morning.

---

## 💼 Phase 4: Placement & Alumni Directory Expansion (Priority 4)

- [ ] **`SIWES-01` Alumni Mentoring Matching**
  - Allow 300L/400L students to request 1-on-1 virtual mentoring sessions with verified alumni.
- [ ] **`SIWES-02` Placement Reminders & Defense Prep**
  - Automated email reminders for SIWES students to update logbooks and sign up for mock defense panels.
- [ ] **`SIWES-03` Verified Company Badges**
  - Highlight partner employers who regularly accept UNILAG computing students.

---

## 🧪 Phase 5: Quality Assurance & Accessibility (Priority 5)

- [ ] **`TEST-01` Automated Test Suite**
  - Unit tests for DB queries and route handlers with Vitest.
  - End-to-end integration tests using Playwright covering: concern submission → admin inbox → status change → student tracking view.
- [ ] **`A11Y-01` Accessibility & Screen Reader Audit**
  - Full audit for WCAG 2.1 AA compliance (aria labels, keyboard navigation, color contrast ratios).
