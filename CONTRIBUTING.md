# Contributing to NACOS Hub

Welcome! We are excited to collaborate with student software engineers and alumni volunteers to build and harden NACOS Hub for production.

---

## 🛠️ Development Workflow

1. **Fork & Clone**:
   ```bash
   git clone https://github.com/nacos-unilag/nacos-hub.git
   cd nacos-hub
   ```
2. **Install & Initialize**:
   ```bash
   npm install
   npx prisma db push
   npm run prisma:seed
   ```
3. **Branching Strategy**:
   Create a descriptive branch for your feature or bugfix:
   ```bash
   git checkout -b feature/auth-per-exec
   # or
   git checkout -b fix/pulse-mobile-touch
   ```
4. **Code Standards**:
   - Write TypeScript in strict mode without `any` where possible.
   - Use Tailwind CSS design tokens defined in `tailwind.config.ts`.
   - Validate all external inputs with Zod schemas.
   - Run linter before committing:
     ```bash
     npm run lint
     ```

---

## 🎯 High-Value Tasks for Volunteer Developers

If you want to pick up an open task, look at the numbered tickets in `ROADMAP.md`:
- **Auth Volunteer**: Implement per-executive login with NextAuth.js or Iron Session (Task `AUTH-01`).
- **DevOps Volunteer**: Set up Docker containerization and PostgreSQL migration scripts (Task `DB-01`).
- **Testing Volunteer**: Write automated tests using Vitest and Playwright (Task `TEST-01`).
- **Frontend / Accessibility Volunteer**: Perform WCAG 2.1 AA audits and keyboard navigation improvements (Task `A11Y-01`).

---

## 🤝 Code Review Guidelines

When submitting a Pull Request:
1. Ensure no `.env` files or secrets are committed.
2. Confirm that public API responses do not leak personal student data or internal notes.
3. Verify mobile responsiveness on viewports from 360px up to 1280px.
4. Provide a short recording or screenshot of the working change.
