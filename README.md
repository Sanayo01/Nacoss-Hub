# NACOS Hub - UNILAG Student-to-Executive Communication Platform

> **PROTOTYPE NOTICE:** This platform is an interactive prototype built to demonstrate student-to-executive communication workflows for NACOS UNILAG. All student and alumni listings are fictional placeholders with realistic Nigerian tech ecosystem examples. Real testing addresses are configured for the General Secretary (`sanayodeji087@gmail.com`) and PRO (`sanusifatih04@gmail.com`) under `TEST_MODE=true`.

---

## 🚀 Quick Start & Setup Commands

Follow these steps to run the platform locally:

```bash
# 1. Install dependencies
npm install

# 2. Push Prisma schema & generate client
npx prisma db push

# 3. Seed database with executives, announcements, calendar, docs, 10 SIWES placements, 6 alumni, and sample concerns
npm run prisma:seed

# 4. Start local development server
npm run dev
```

Visit the app at: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Environment Variables Configuration

Create a `.env` file in the root folder (or copy from `.env.example`):

```bash
# Database connection (SQLite local file)
DATABASE_URL="file:./dev.db"

# Test mode: redirects placeholder office emails to General Secretary
TEST_MODE=true

# Admin Passcode for local executive prototype demonstration
ADMIN_PASSCODE="nacos-unilag-exec-2026"
ADMIN_SESSION_SECRET="nacos-prototype-super-secret-key-32chars"

# Optional SMTP Settings (If blank, Nodemailer logs full email payload to console in dev mode)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
MAIL_FROM="NACOS UNILAG Hub <noreply@nacos-unilag.org>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🔄 Resetting and Re-seeding Data

To clear the local SQLite database and restore clean initial demo records:

```bash
# Clean push and reset database schema
npx prisma db push --force-reset

# Seed full dataset
npm run prisma:seed
```

---

## 📱 Feature Overview

- **Executive Directory (`/execs`)**: Searchable list of all 12 NACOS UNILAG offices with responsibilities and routing buttons.
- **Routed Concern Submission (`/concern`)**: 3-step wizard with category auto-routing, anonymous mode, privacy shield notice, and tracking ID generation (`NH-2026-XXXX`).
- **Audit Timeline (`/track/[trackingId]`)**: Real-time status tracker (Received → Being Handled → Resolved / Declined) with public executive response.
- **SIWES Bridge & Alumni Directory (`/siwes`)**:
  - Filterable directory by company, stack, and city.
  - Placement stats strip (total placed, companies count, top stacks).
  - "Share my SIWES placement" & "Join the alumni directory" forms with mandatory consent agreements.
  - Monthly SIWES check-in card for students currently on internship.
  - Removal / Edit request submission.
  - "Who is on SIWES now" counter on the home page.
- **Executive Admin Console (`/admin`)**:
  - Passcode-protected with signed httpOnly cookies (`nacos-unilag-exec-2026`).
  - Concern inbox filtered by office and status.
  - Status updater with public executive response field and audit update logging (`ConcernUpdate`).
  - Announcement composer with 1-click **Share kit** (formatted for WhatsApp groups and Instagram/X).
  - Moderation queue for approving/rejecting placements, alumni, and resolving removal requests.
  - CSV export for approved placements and alumni.
- **Departmental Calendar (`/calendar`)**: Grouped week view, month grid, single `.ics` event download, and live subscription feed (`/api/calendar.ics`).
- **Document Vault (`/documents`)**: Official constitution, dues clearance guides, past questions bank, and letter templates.
- **Student Pulse (`/pulse`)**: Anonymous 1-tap poll voting with device duplicate prevention.
- **Student Handbook (`/handbook`)**: Searchable accordion guide on departmental governance.
- **Prototype Status Page (`/about`)**: Complete breakdown of real vs mocked features and known architectural limitations.

---

## 🏛️ Executive Routing Map

Student concerns submitted on the Hub are routed as follows:
- **Academics** → Director of Academics
- **Welfare** → Welfare Director
- **Events** → Social Director
- **Finance/Dues** → Financial Secretary
- **Software/Tech** → Director of Software
- **Media/Announcements** → Public Relations Officer (PRO)
- **General/Other** → General Secretary
