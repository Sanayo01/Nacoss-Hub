# Security Audit & Pre-Production Checklist

This document details the frank security considerations, vulnerability mitigation requirements, and regulatory compliance steps that **must be executed** prior to launching NACOS Hub with live student data.

---

## 🚨 Critical Items Requiring Review

### 1. Authentication & Passcode Deprecation
- **Current Prototype State**: The `/admin` portal authenticates via a shared `ADMIN_PASSCODE` in `.env` stored in a signed HMAC cookie.
- **Production Vulnerability**: If the passcode leaks, all executive powers are exposed.
- **Action Required**: Must be eliminated in favor of individual executive accounts, salted & hashed passwords (Argon2id), session expiration, and 2FA.

### 2. Nigeria Data Protection Act (NDPA 2023) Compliance
- **Consent Records**: All SIWES and alumni listings require explicit consent checkboxes (`consentGiven: true`). In production, timestamped audit logs of consent acceptance and IP addresses must be preserved.
- **Right to Erasure (Removal Requests)**: The platform includes a removal request queue (`RemovalRequest`). An automated deletion workflow must be implemented so students can request total record erasure within 72 hours.
- **Data Minimization**: Never store matriculation numbers, phone numbers, or residential addresses on public or semi-public records.

### 3. Anonymous Concern Protection
- **No Trace Policy**: When `isAnonymous: true` is toggled:
  - Do NOT log client IP addresses alongside concern records.
  - Omit sender email and name completely from DB storage and server logs.
  - Never allow executive responses to correlate anonymous tracking IDs to student accounts.

### 4. Injection & Input Sanitization
- **HTML & XSS Stripping**: Input sanitization via `sanitizeText` strips HTML tags before DB write.
- **Recommendation**: Integrate DOMPurify or sanitize-html for comprehensive tag and attribute filtering.
- **SQL Injection**: Prisma ORM provides parameterized SQL queries by default, protecting against standard SQL injection vectors.

### 5. Rate Limiting & Denial of Service (DoS)
- **Current State**: Sliding window rate limiter in memory (`lib/rate-limit.ts`).
- **Production Vulnerability**: In-memory limiters do not persist across server restarts or distribute across multiple cloud instances.
- **Action Required**: Connect to Upstash Redis with IP and fingerprint rate limiting to prevent spam floods on `/api/concerns` and `/api/siwes`.

### 6. Email Infrastructure & Spam Spoofing
- **SMTP Security**: Ensure production transactional emails use TLS on port 587 or 465.
- **DNS Records**: Configure SPF (`v=spf1 include:... ~all`), DKIM, and DMARC for `nacos-unilag.org` to protect departmental emails from being spoofed or flagged as spam.

### 7. File & Document Storage
- **Current State**: Download links point to placeholder URLs.
- **Action Required**: When uploading actual departmental documents and past questions, use AWS S3 or Cloudflare R2 with signed URLs, virus scanning, and strict MIME type validation.
