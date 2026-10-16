"use client";

import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Code2,
  Database,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
          <Info className="h-3.5 w-3.5" />
          Technical & Implementation Status
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-navy-heading">
          Prototype Status & Disclosure
        </h1>
        <p className="text-sm text-navy-body">
          A clear, honest overview of what is real, what is mocked, and what remains to be built before production deployment.
        </p>
      </div>

      {/* PROMINENT DISCLAIMER BOX */}
      <div className="p-6 rounded-3xl border border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 via-navy-card to-navy-card space-y-2 shadow-lg">
        <div className="flex items-center gap-2 text-yellow-300 font-bold uppercase text-xs tracking-wider">
          <ShieldAlert className="h-5 w-5" /> Official Prototype Disclaimer
        </div>
        <p className="text-xs md:text-sm text-navy-heading font-medium leading-relaxed">
          Prototype built to show the idea. To be rebuilt and reviewed by a volunteer developer team before any real student data is used.
        </p>
      </div>

      {/* 3 COLUMN STATUS BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* WHAT IS REAL */}
        <div className="p-6 rounded-3xl border border-navy-border bg-navy-card space-y-4">
          <div className="flex items-center gap-2 text-mint font-bold uppercase text-xs">
            <CheckCircle2 className="h-4 w-4" /> What is Real & Working
          </div>
          <ul className="text-xs text-navy-body space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-mint font-bold">✓</span>
              <span>Next.js 14 App Router with Tailwind CSS dark navy + mint UI.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-mint font-bold">✓</span>
              <span>Zod validation on all public POST/PATCH routes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-mint font-bold">✓</span>
              <span>HTML sanitization on all user-submitted text inputs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-mint font-bold">✓</span>
              <span>In-memory IP rate limiter protecting public endpoints.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-mint font-bold">✓</span>
              <span>Auto-routing to 12 departmental executive offices based on category.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-mint font-bold">✓</span>
              <span>RFC 5545 `.ics` departmental calendar generator.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-mint font-bold">✓</span>
              <span>Signed httpOnly cookie-based session for executive administration.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-mint font-bold">✓</span>
              <span>CSV export for approved SIWES & alumni records.</span>
            </li>
          </ul>
        </div>

        {/* WHAT IS MOCKED */}
        <div className="p-6 rounded-3xl border border-navy-border bg-navy-card space-y-4">
          <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase text-xs">
            <Database className="h-4 w-4" /> What is Mocked / Sample Data
          </div>
          <ul className="text-xs text-navy-body space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">~</span>
              <span>Executive roster uses placeholder names and accounts, except real test addresses for GenSec & PRO.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">~</span>
              <span>SIWES placements and Alumni listings are fictional sample entries with realistic Nigerian tech firms.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">~</span>
              <span>Document Vault download links point to placeholder mock URLs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">~</span>
              <span>Email engine operates in console dev logging fallback when SMTP credentials are not configured.</span>
            </li>
          </ul>
        </div>

        {/* WHAT IS NOT BUILT YET */}
        <div className="p-6 rounded-3xl border border-navy-border bg-navy-card space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs">
            <Code2 className="h-4 w-4" /> Not Built Yet (Roadmap)
          </div>
          <ul className="text-xs text-navy-body space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">&bull;</span>
              <span>Per-executive role-based login (RBAC) with hashed passwords.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">&bull;</span>
              <span>Student UNILAG email verification / portal integration.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">&bull;</span>
              <span>Automated WhatsApp bot posting (due to Meta API limitations).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">&bull;</span>
              <span>PostgreSQL / Redis migration for distributed deployment.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">&bull;</span>
              <span>End-to-end automated test suite (Playwright / Cypress).</span>
            </li>
          </ul>
        </div>
      </div>

      {/* KNOWN LIMITATIONS */}
      <div className="p-6 rounded-3xl border border-navy-border bg-navy-card space-y-3">
        <h3 className="font-bold text-sm uppercase text-navy-heading flex items-center gap-2">
          <Lock className="h-4 w-4 text-mint" /> Known Architectural Limitations
        </h3>
        <div className="text-xs text-navy-body leading-relaxed space-y-2">
          <p>
            1. <strong>Local SQLite Storage:</strong> SQLite (`dev.db`) is ideal for local demonstration and pitch reviews, but will experience write concurrency locks if deployed to multi-container cloud environments like Vercel or AWS ECS. It must be migrated to managed PostgreSQL.
          </p>
          <p>
            2. <strong>In-Memory Rate Limiting:</strong> The current rate limiter runs in memory. On multi-instance serverless deployments, rate counters are not shared across instances without a Redis store.
          </p>
          <p>
            3. <strong>Shared Passcode:</strong> The `/admin` portal relies on a single shared `ADMIN_PASSCODE` in `.env`. Before executive handover, individual accounts with audit trails per executive must be created.
          </p>
          <p>
            4. <strong>Security Audit:</strong> No third-party security or penetration audit has been conducted yet. Real student matric numbers or passwords must never be stored on this prototype.
          </p>
        </div>
      </div>

      {/* HANDOVER CTA */}
      <div className="p-6 rounded-3xl border border-navy-border bg-navy-bgStart flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-navy-heading uppercase">Interested in joining the dev team?</h4>
          <p className="text-xs text-navy-body">Review CONTRIBUTING.md, ROADMAP.md, and ARCHITECTURE.md on our GitHub repo.</p>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow shrink-0 flex items-center gap-1.5"
        >
          Open Admin Demo <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
