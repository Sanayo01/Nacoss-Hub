# NACOS Hub Architecture & Technical Design

This document details the software architecture, repository structure, data layer abstraction, and executive routing mechanics of NACOS Hub.

---

## 🏗️ 1. Technical Stack

- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS with custom theme tokens:
  - Deep Navy background (`#0B1220` to `#111827`)
  - Elevated card surfaces (`#131C2E`, `#18243B`)
  - Accent Mint green (`#34D399`, `#10B981`)
  - Text hierarchy (`#F5F5F0` headings, `#94A3B8` body, `#64748B` subtle)
- **Database & ORM**: SQLite (`dev.db`) abstracted through Prisma ORM (`@prisma/client`).
- **Validation**: Zod schema validation on all inputs before persistence.
- **Security**:
  - HTML text sanitization (`sanitizeText`) on text inputs.
  - In-memory rate limiting (`lib/rate-limit.ts`) on public POST endpoints.
  - Signed HMAC SHA-256 httpOnly cookie session for executive authentication.
  - Security headers in `next.config.js` (X-Frame-Options, X-Content-Type-Options, etc.).
- **Email Dispatch**: Nodemailer with SMTP credentials or console fallback mode in development.

---

## 📁 2. Directory Structure

```
Nacos-hub/
├── app/
│   ├── about/                    # Prototype status & technical disclosure
│   ├── admin/                    # Executive Admin Portal (passcode gated)
│   ├── announcements/            # Official broadcasts feed & single view
│   ├── api/                      # Route handlers
│   │   ├── admin/                # Admin auth, concerns, announcements, siwes, export
│   │   ├── announcements/        # Public announcements GET
│   │   ├── calendar.ics/         # RFC 5545 iCalendar feed
│   │   ├── concerns/             # Concern creation & public tracking
│   │   ├── documents/            # Document vault GET
│   │   ├── events/               # Calendar events GET
│   │   ├── executives/           # 12 active executive offices GET
│   │   ├── pulse/                # Pulse polls GET & vote POST
│   │   ├── siwes/                # Placements, alumni, check-ins, removal requests
│   │   └── stats/                # Aggregate platform metrics
│   ├── calendar/                 # Academic & departmental calendar (.ics)
│   ├── concern/                  # 3-step routed concern submission wizard
│   ├── documents/                # Document vault
│   ├── execs/                    # 12 Executive offices directory
│   ├── handbook/                 # "How NACOS Works" student handbook
│   ├── pulse/                    # Departmental pulse polls & voting
│   ├── siwes/                    # SIWES Bridge & Alumni Directory
│   ├── track/                    # Concern tracking ID search
│   │   └── [trackingId]/         # Timeline audit trail & public response
│   ├── globals.css               # Base theme styles & custom scrollbars
│   ├── layout.tsx                # Root layout with responsive navigation
│   └── page.tsx                  # Home landing page with live stats
├── components/
│   ├── BottomNav.tsx             # Mobile bottom navigation bar
│   ├── Footer.tsx                # Campaign footer & quick links
│   ├── MoreSheet.tsx             # Mobile slide-up drawer menu
│   └── Navbar.tsx                # Desktop sticky navbar with brand & CTAs
├── config/
│   └── offices.ts                # Executive office slugs & category routing map
├── lib/
│   ├── admin-auth.ts             # Signed HMAC cookie session manager
│   ├── db/
│   │   └── index.ts              # Data abstraction layer over PrismaClient
│   ├── mailer.ts                 # Nodemailer email dispatcher with dev fallback
│   ├── rate-limit.ts             # In-memory IP-based sliding rate limiter
│   └── utils.ts                  # Tracking ID generator & text sanitizer
├── prisma/
│   ├── schema.prisma             # Data models definition
│   └── seed.ts                   # Database seed script
└── README.md                     # General setup & quick start guide
```

---

## 🗄️ 3. Database Abstraction Layer (`lib/db/index.ts`)

Direct database calls are not permitted inside React components or API handlers. Instead, all Prisma queries are wrapped in `lib/db/index.ts`:

1. **Singleton Instance**: Reuses a single `PrismaClient` in development across hot reloads to avoid connection pool exhaustion.
2. **Field Masking & Privacy Shielding**: Public methods like `getPublicConcernTracking` explicitly use Prisma `select` projections to exclude `senderName`, `senderEmail`, and internal notes from ever leaving the database boundary.
3. **Audit Updates**: `updateConcernStatusAndResponse` uses a Prisma transaction (`db.$transaction`) to guarantee that every status update creates an immutable audit row in `ConcernUpdate`.

---

## 🧭 4. Office Routing Mechanics

The routing engine lives in `config/offices.ts`:

```typescript
export const CATEGORY_OFFICE_MAP: Record<string, string> = {
  Academics: "director-of-academics",
  Welfare: "welfare-director",
  Events: "social-director",
  "Finance/Dues": "financial-secretary",
  "Software/Tech": "director-of-software",
  "Media/Announcements": "pro",
  "General/Other": "general-secretary",
};
```

When a student submits a concern:
1. `getTargetOfficeSlug(category)` maps the category to an office slug.
2. If the user picked a specific executive directly from `/execs`, that slug takes precedence.
3. The server generates a unique tracking code (`NH-2026-XXXX`).
4. Nodemailer alerts the executive via email (redirecting to the General Secretary's address when `TEST_MODE=true` is set).

---

## 🔒 5. Privacy & Security Architecture

1. **Anonymous Mode**: Anonymous submissions store `isAnonymous: true` and discard student names and emails. Public tracking endpoints (`/api/concerns/[trackingId]`) omit sender fields entirely.
2. **SIWES / Alumni Privacy**: Phone numbers and home addresses are never stored. Public queries filter by `isApproved: true` and `consentGiven: true`.
3. **Rate Limiting**: Applied per IP address using a sliding timestamp window to thwart spam bots.
4. **Honeypot Trap**: Invisible `honeypot` field in forms quietly absorbs automated bot posts without execution.
