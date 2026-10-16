"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Send,
  Shield,
  Check,
  Copy,
  UserCheck,
  UserX,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Search,
} from "lucide-react";

const CATEGORIES = [
  {
    title: "Academics",
    slug: "Academics",
    office: "Vice President",
    icon: "📚",
    desc: "Tutorial timetables, exam/test clashes, past questions, and grade issues.",
  },
  {
    title: "Welfare",
    slug: "Welfare",
    office: "Welfare Secretary",
    icon: "🏥",
    desc: "Lab ventilation, AC/lighting, lecture hall acoustics, and emergency aid.",
  },
  {
    title: "Events",
    slug: "Events",
    office: "Social Secretary",
    icon: "🎉",
    desc: "Hackathons, dinner tickets, freshers orientation, and gaming leagues.",
  },
  {
    title: "Finance/Dues",
    slug: "Finance/Dues",
    office: "Financial Secretary",
    icon: "💳",
    desc: "Departmental dues clearance receipts, bank transfer confirmation.",
  },
  {
    title: "Software/Tech",
    slug: "Software/Tech",
    office: "Software Director",
    icon: "💻",
    desc: "Developer masterclasses, open-source projects, and lab tech support.",
  },
  {
    title: "Media/Announcements",
    slug: "Media/Announcements",
    office: "PRO",
    icon: "📢",
    desc: "Broadcast requests, press coverage, and social channel inquiries.",
  },
  {
    title: "General/Other",
    slug: "General/Other",
    office: "General Secretary",
    icon: "🏛️",
    desc: "Official recommendation letters, constitutional queries, general issues.",
  },
];

function ConcernForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const preselectedOffice = searchParams.get("office");
  const preselectedCategory = searchParams.get("category");

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(preselectedCategory || "General/Other");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState("100L");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<{
    trackingId: string;
    targetOffice: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (preselectedCategory) {
      setSelectedCategory(preselectedCategory);
    }
  }, [preselectedCategory]);

  const currentCategoryObj = CATEGORIES.find((c) => c.slug === selectedCategory) || CATEGORIES[6];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (subject.trim().length < 3) {
      setErrorMsg("Subject must be at least 3 characters long.");
      return;
    }
    if (message.trim().length < 10) {
      setErrorMsg("Message must be at least 10 characters long.");
      return;
    }
    if (!isAnonymous && senderEmail && !senderEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address to receive tracking updates.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/concerns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          subject: subject.trim(),
          message: message.trim(),
          isAnonymous,
          senderName: isAnonymous ? null : senderName.trim() || null,
          senderEmail: isAnonymous ? null : senderEmail.trim() || null,
          level: level || null,
          honeypot,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit concern");
      }

      setSuccessData({
        trackingId: json.trackingId,
        targetOffice: json.targetOffice,
      });
      setStep(4); // Success step
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while submitting your concern.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTrackingId = () => {
    if (successData) {
      navigator.clipboard.writeText(successData.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* HEADER */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
          <Shield className="h-3.5 w-3.5" />
          Routed Student Concern System
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-navy-heading">
          Submit a Concern
        </h1>
        <p className="text-xs md:text-sm text-navy-body">
          Every submission receives a unique Tracking ID. Your message is automatically routed to the responsible executive.
        </p>
      </div>

      {/* STEP INDICATOR */}
      {step < 4 && (
        <div className="flex items-center justify-between border-b border-navy-border pb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-2 ${
                step === s
                  ? "text-mint font-bold"
                  : step > s
                  ? "text-navy-heading font-semibold"
                  : "text-navy-subtle"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border ${
                  step === s
                    ? "bg-mint text-navy-onAccent border-mint"
                    : step > s
                    ? "bg-mint/20 text-mint border-mint/40"
                    : "border-navy-border text-navy-subtle"
                }`}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              <span className="text-xs hidden sm:inline">
                {s === 1 ? "Category" : s === 2 ? "Details" : "Identity"}
              </span>
            </div>
          ))}
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: CHOOSE CATEGORY */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-navy-heading uppercase">
            Step 1: What is your concern about?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <div
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-mint bg-mint/10 shadow-lg shadow-mint/5"
                      : "border-navy-border bg-navy-card hover:bg-navy-cardHover"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{cat.icon}</span>
                    {isSelected && (
                      <span className="rounded-full bg-mint p-1 text-navy-onAccent">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-navy-heading">{cat.title}</h3>
                    <p className="text-[11px] text-navy-body line-clamp-2 mt-0.5">{cat.desc}</p>
                    <span className="inline-block text-[10px] font-semibold text-mint mt-2">
                      Routes to: {cat.office}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-navy-border bg-navy-card p-4 flex items-center justify-between">
            <span className="text-xs text-navy-body">
              This concern will be assigned to:{" "}
              <strong className="text-mint font-bold">{currentCategoryObj.office}</strong>
            </span>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow min-h-touch flex items-center gap-1.5 shrink-0"
            >
              Next: Write Details <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SUBJECT & MESSAGE */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-heading uppercase">
              Step 2: Describe your concern
            </h2>
            <span className="text-xs text-mint font-semibold">
              To: {currentCategoryObj.office}
            </span>
          </div>

          {/* Level Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy-heading uppercase">Your Level</label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["100L", "200L", "300L", "400L", "500L"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border min-h-touch ${
                    level === lvl
                      ? "border-mint bg-mint text-navy-onAccent font-bold"
                      : "border-navy-border bg-navy-card text-navy-body hover:text-navy-heading"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-navy-heading uppercase">
              Subject line <span className="text-mint">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. CSC 301 Test Clash with GST 212"
              className="w-full rounded-2xl border border-navy-border bg-navy-card p-3.5 text-xs md:text-sm text-navy-heading placeholder:text-navy-subtle focus:border-mint focus:outline-none"
            />
          </div>

          {/* Message Field with Live Counter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-navy-heading uppercase">
                Detailed Message <span className="text-mint">*</span>
              </label>
              <span className={`text-[11px] font-mono ${message.length > 2800 ? "text-red-400" : "text-navy-subtle"}`}>
                {message.length} / 3000
              </span>
            </div>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide full context, affected course codes, dates, or relevant details so the executive can act immediately..."
              className="w-full rounded-2xl border border-navy-border bg-navy-card p-3.5 text-xs md:text-sm text-navy-heading placeholder:text-navy-subtle focus:border-mint focus:outline-none resize-none"
            />
          </div>

          {/* Hidden Honeypot Field for Spam Protection */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-xs font-semibold text-navy-heading bg-navy-card hover:bg-navy-cardHover border border-navy-border rounded-xl min-h-touch flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Change Category
            </button>
            <button
              type="button"
              onClick={() => {
                if (subject.trim().length < 3) {
                  setErrorMsg("Subject must be at least 3 characters.");
                  return;
                }
                if (message.trim().length < 10) {
                  setErrorMsg("Message must be at least 10 characters.");
                  return;
                }
                setErrorMsg("");
                setStep(3);
              }}
              className="px-5 py-2.5 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow min-h-touch flex items-center gap-1.5"
            >
              Next: Identity & Submit <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: IDENTITY CHOICE & SUBMIT */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-base font-bold text-navy-heading uppercase">
            Step 3: Choose your privacy setting
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setIsAnonymous(false)}
              className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                !isAnonymous
                  ? "border-mint bg-mint/10 shadow-lg"
                  : "border-navy-border bg-navy-card hover:bg-navy-cardHover"
              }`}
            >
              <UserCheck className={`h-6 w-6 shrink-0 ${!isAnonymous ? "text-mint" : "text-navy-subtle"}`} />
              <div>
                <h3 className="font-bold text-sm text-navy-heading">Send with My Name</h3>
                <p className="text-[11px] text-navy-body mt-0.5">
                  Allows the executive to reply directly to you and clarify details.
                </p>
              </div>
            </div>

            <div
              onClick={() => setIsAnonymous(true)}
              className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                isAnonymous
                  ? "border-mint bg-mint/10 shadow-lg"
                  : "border-navy-border bg-navy-card hover:bg-navy-cardHover"
              }`}
            >
              <UserX className={`h-6 w-6 shrink-0 ${isAnonymous ? "text-mint" : "text-navy-subtle"}`} />
              <div>
                <h3 className="font-bold text-sm text-navy-heading">Send Anonymously</h3>
                <p className="text-[11px] text-navy-body mt-0.5">
                  Your name and identity will NEVER be recorded or displayed to anyone.
                </p>
              </div>
            </div>
          </div>

          {!isAnonymous && (
            <div className="space-y-3 p-4 rounded-2xl border border-navy-border bg-navy-card">
              <div className="space-y-1">
                <label className="text-xs font-bold text-navy-heading uppercase">Your Full Name (Optional)</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Babajide Fashola"
                  className="w-full rounded-xl border border-navy-border bg-navy-bgStart p-3 text-xs text-navy-heading focus:border-mint focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-navy-heading uppercase">Email Address (To receive updates & tracking link)</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. student@gmail.com"
                  className="w-full rounded-xl border border-navy-border bg-navy-bgStart p-3 text-xs text-navy-heading focus:border-mint focus:outline-none"
                />
              </div>
            </div>
          )}

          {isAnonymous && (
            <div className="p-4 rounded-2xl border border-navy-border bg-navy-card space-y-1">
              <label className="text-xs font-bold text-navy-heading uppercase">Optional Email for Tracking Copy</label>
              <p className="text-[11px] text-navy-body mb-2">
                Even with anonymous sending, you can optionally provide an email to receive your Tracking ID. Your email will not be tied to the public record.
              </p>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="e.g. student@gmail.com (Optional)"
                className="w-full rounded-xl border border-navy-border bg-navy-bgStart p-3 text-xs text-navy-heading focus:border-mint focus:outline-none"
              />
            </div>
          )}

          {/* PRIVACY NOTE */}
          <div className="p-4 rounded-2xl border border-mint/20 bg-mint/5 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-mint uppercase text-[11px]">
              <Shield className="h-4 w-4 shrink-0" />
              Privacy & Data Protection Notice
            </div>
            <p className="text-navy-body leading-relaxed text-[11px]">
              {isAnonymous
                ? "You chose Anonymous Mode. Your name, email, and IP address are never exposed on any public tracking page, API endpoint, or public log. Only the routed office, category, and sanitized issue text will be visible to the responding executive."
                : "Your name and email will be shared strictly with the assigned executive so they can review and reply. They will never appear on the public tracking timeline."}
            </p>
            <p className="text-navy-subtle text-[10px]">
              This is a prototype system. No phone numbers or sensitive student credentials are ever requested or stored.
            </p>
          </div>


          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 text-xs font-semibold text-navy-heading bg-navy-card hover:bg-navy-cardHover border border-navy-border rounded-xl min-h-touch flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Details
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow-lg shadow-mint/20 min-h-touch flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting Concern...</span>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit Concern
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: SUCCESS SCREEN WITH TRACKING ID */}
      {step === 4 && successData && (
        <div className="p-6 md:p-8 rounded-3xl border border-mint/40 bg-gradient-to-b from-navy-card via-navy-bgStart to-navy-card text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/20 text-mint border border-mint/40 shadow-inner">
            <Check className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold uppercase text-navy-heading">
              Concern Registered!
            </h2>
            <p className="text-xs md:text-sm text-navy-body max-w-md mx-auto">
              Your concern has been assigned to <strong className="text-mint">{successData.targetOffice}</strong>.
            </p>
          </div>

          {/* LARGE TRACKING ID DISPLAY */}
          <div className="p-6 rounded-2xl border border-mint/30 bg-navy-bgStart max-w-sm mx-auto space-y-2 shadow-inner">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-navy-subtle block">
              YOUR UNIQUE TRACKING ID
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl md:text-3xl font-extrabold font-mono text-mint tracking-wider">
                {successData.trackingId}
              </span>
              <button
                onClick={handleCopyTrackingId}
                aria-label="Copy tracking ID"
                className="p-2 rounded-xl bg-navy-card border border-navy-border hover:border-mint text-navy-heading transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-mint" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copied && <span className="text-[10px] text-mint font-semibold block">Copied to clipboard!</span>}
          </div>

          <div className="p-4 rounded-xl border border-navy-border bg-navy-card max-w-md mx-auto text-left flex items-start gap-3 text-xs text-navy-body">
            <Sparkles className="h-5 w-5 text-mint shrink-0 mt-0.5" />
            <div>
              <strong className="text-navy-heading block">Keep this ID safe:</strong>
              Use your Tracking ID on NACOS Hub to track progress, view audit updates, and inspect the official executive response when resolved.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={`/track/${successData.trackingId}`}
              className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow-lg min-h-touch flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" /> Track Status Now
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-navy-heading bg-navy-card hover:bg-navy-cardHover border border-navy-border rounded-xl min-h-touch flex items-center justify-center"
            >
              Return Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConcernPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-navy-subtle">Loading concern portal...</div>}>
      <ConcernForm />
    </Suspense>
  );
}
