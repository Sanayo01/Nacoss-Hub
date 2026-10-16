"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Search,
  Plus,
  Building2,
  MapPin,
  Code,
  Lightbulb,
  X,
  Check,
  Sparkles,
  AlertCircle,
  GraduationCap,
  Users,
  Linkedin,
  Clock,
  Shield,
  FileQuestion,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

interface SiwesPlacement {
  id: string;
  studentName: string;
  level: string;
  company: string;
  role: string;
  techStack: string;
  city: string;
  startDate?: string | null;
  endDate?: string | null;
  howIGotIn?: string | null;
  tipsToApply: string;
  contactPreference: string;
  createdAt: string;
}

interface Alumnus {
  id: string;
  name: string;
  graduationYear: string;
  currentCompany: string;
  currentRole: string;
  city: string;
  techStack: string;
  advice: string;
  linkedinUrl?: string | null;
  createdAt: string;
}

export default function SiwesPage() {
  const [activeTab, setActiveTab] = useState<"placements" | "alumni">("placements");
  const [placements, setPlacements] = useState<SiwesPlacement[]>([]);
  const [alumni, setAlumni] = useState<Alumnus[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [loading, setLoading] = useState(true);

  // Modals
  const [placementModalOpen, setPlacementModalOpen] = useState(false);
  const [alumniModalOpen, setAlumniModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [removalModalTarget, setRemovalModalTarget] = useState<{ id: string; type: "PLACEMENT" | "ALUMNUS"; name: string } | null>(null);

  // Placement Form State
  const [pName, setPName] = useState("");
  const [pLevel, setPLevel] = useState("400L");
  const [pCompany, setPCompany] = useState("");
  const [pRole, setPRole] = useState("");
  const [pTechStack, setPTechStack] = useState("");
  const [pCity, setPCity] = useState("Lagos (Yaba)");
  const [pStartDate, setPStartDate] = useState("");
  const [pEndDate, setPEndDate] = useState("");
  const [pHowIGotIn, setPHowIGotIn] = useState("");
  const [pTips, setPTips] = useState("");
  const [pContactPref, setPContactPref] = useState("none");
  const [pConsent, setPConsent] = useState(false);

  // Alumni Form State
  const [aName, setAName] = useState("");
  const [aYear, setAYear] = useState("2024");
  const [aCompany, setACompany] = useState("");
  const [aRole, setARole] = useState("");
  const [aCity, setACity] = useState("Lagos");
  const [aTechStack, setATechStack] = useState("");
  const [aAdvice, setAAdvice] = useState("");
  const [aLinkedin, setALinkedin] = useState("");
  const [aConsent, setAConsent] = useState(false);

  // Check-In Form State
  const [cName, setCName] = useState("");
  const [cLevel, setCLevel] = useState("400L");
  const [cCompany, setCCompany] = useState("");
  const [cStatus, setCStatus] = useState<"STILL_PLACED" | "COMPLETED" | "SEEKING_HELP">("STILL_PLACED");
  const [cNotes, setCNotes] = useState("");
  const [cNeedsHelp, setCNeedsHelp] = useState(false);

  // Removal Request Form State
  const [rReason, setRReason] = useState("");
  const [rEmail, setREmail] = useState("");

  // Submission statuses
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/siwes");
        const json = await res.json();
        if (json.success) {
          if (json.data.placements) setPlacements(json.data.placements);
          if (json.data.alumni) setAlumni(json.data.alumni);
        }
      } catch (err) {
        console.error("Failed to fetch SIWES data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute stats strip
  const totalPlaced = placements.length;
  const uniqueCompanies = new Set(placements.map((p) => p.company.trim().toLowerCase())).size;

  // Extract most common tech stacks
  const stackCounts: Record<string, number> = {};
  placements.forEach((p) => {
    p.techStack.split(",").forEach((s) => {
      const clean = s.trim();
      if (clean) stackCounts[clean] = (stackCounts[clean] || 0) + 1;
    });
  });
  const topStacks = Object.entries(stackCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([stack]) => stack);

  const placementCities = ["All", ...Array.from(new Set(placements.map((p) => p.city)))];

  const filteredPlacements = placements.filter((p) => {
    const matchesCity = selectedCity === "All" || p.city === selectedCity;
    const matchesLevel = selectedLevel === "All" || p.level === selectedLevel;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.company.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.techStack.toLowerCase().includes(q) ||
      p.studentName.toLowerCase().includes(q) ||
      (p.howIGotIn && p.howIGotIn.toLowerCase().includes(q));
    return matchesCity && matchesLevel && matchesSearch;
  });

  const filteredAlumni = alumni.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.currentCompany.toLowerCase().includes(q) ||
      a.currentRole.toLowerCase().includes(q) ||
      a.techStack.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
    );
  });

  // Handlers
  const handlePlacementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    if (!pConsent) {
      setFeedbackMsg({ type: "error", text: "You must check the consent box to proceed." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/siwes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "placement",
          studentName: pName,
          level: pLevel,
          company: pCompany,
          role: pRole,
          techStack: pTechStack,
          city: pCity,
          startDate: pStartDate || null,
          endDate: pEndDate || null,
          howIGotIn: pHowIGotIn || null,
          tipsToApply: pTips,
          contactPreference: pContactPref,
          consentGiven: pConsent,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Submission failed");
      setFeedbackMsg({ type: "success", text: "Thanks, it will appear after review." });
      setTimeout(() => {
        setPlacementModalOpen(false);
        setFeedbackMsg(null);
        setPName("");
        setPCompany("");
        setPRole("");
        setPTechStack("");
        setPTips("");
        setPHowIGotIn("");
      }, 2500);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to submit" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAlumniSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    if (!aConsent) {
      setFeedbackMsg({ type: "error", text: "You must check the consent box to proceed." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/siwes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "alumnus",
          name: aName,
          graduationYear: aYear,
          currentCompany: aCompany,
          currentRole: aRole,
          city: aCity,
          techStack: aTechStack,
          advice: aAdvice,
          linkedinUrl: aLinkedin || null,
          consentGiven: aConsent,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Submission failed");
      setFeedbackMsg({ type: "success", text: "Thanks, it will appear after review." });
      setTimeout(() => {
        setAlumniModalOpen(false);
        setFeedbackMsg(null);
        setAName("");
        setACompany("");
        setARole("");
        setATechStack("");
        setAAdvice("");
        setALinkedin("");
      }, 2500);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to submit" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/siwes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "check-in",
          studentName: cName,
          level: cLevel,
          company: cCompany,
          status: cStatus,
          notes: cNotes || null,
          needsHelp: cNeedsHelp,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Check-in failed");
      setFeedbackMsg({ type: "success", text: "Check-in recorded! The executive team is in touch." });
      setTimeout(() => {
        setCheckInModalOpen(false);
        setFeedbackMsg(null);
        setCName("");
        setCCompany("");
        setCNotes("");
      }, 2500);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to record check-in" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removalModalTarget) return;
    setFeedbackMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/siwes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "removal",
          targetType: removalModalTarget.type,
          targetId: removalModalTarget.id,
          reason: rReason,
          requesterEmail: rEmail || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Request failed");
      setFeedbackMsg({ type: "success", text: "Your request has been forwarded to the Secretariat." });
      setTimeout(() => {
        setRemovalModalTarget(null);
        setFeedbackMsg(null);
        setRReason("");
        setREmail("");
      }, 2500);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to submit request" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
            <Briefcase className="h-3.5 w-3.5" />
            NACOSS UNILAG Placements & Alumni Hub
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-navy-heading">
            SIWES & Alumni Bridge
          </h1>
          <p className="text-xs md:text-sm text-navy-body max-w-xl">
            Real internship placements, interview strategies, technology stacks, and direct career insights from UNILAG Computing graduates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPlacementModalOpen(true)}
            className="px-4 py-2.5 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow-lg transition-all min-h-touch flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Share SIWES Placement
          </button>
          <button
            onClick={() => setAlumniModalOpen(true)}
            className="px-4 py-2.5 text-xs font-semibold text-navy-heading bg-navy-card hover:bg-navy-cardHover border border-navy-border hover:border-mint/40 rounded-xl transition-colors min-h-touch flex items-center gap-1.5"
          >
            <GraduationCap className="h-4 w-4 text-mint" /> Join Alumni Directory
          </button>
        </div>
      </div>

      {/* STATS STRIP */}
      <section className="grid grid-cols-3 gap-3 md:gap-4 p-4 rounded-3xl border border-navy-border bg-navy-card">
        <div className="flex flex-col items-center justify-center text-center p-2">
          <span className="text-xl md:text-3xl font-extrabold text-mint">{totalPlaced}</span>
          <span className="text-[11px] md:text-xs text-navy-body">Students Placed</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center p-2 border-x border-navy-border/60">
          <span className="text-xl md:text-3xl font-extrabold text-navy-heading">{uniqueCompanies}</span>
          <span className="text-[11px] md:text-xs text-navy-body">Tech Companies</span>
        </div>
        <div className="flex flex-col items-center justify-center text-center p-2">
          <span className="text-xs md:text-sm font-bold text-mint line-clamp-1">{topStacks.join(", ") || "TypeScript, Python"}</span>
          <span className="text-[11px] md:text-xs text-navy-body">Top Tech Stacks</span>
        </div>
      </section>

      {/* MONTHLY CHECK-IN BANNER */}
      <div className="p-5 rounded-3xl border border-mint/30 bg-gradient-to-r from-mint/10 via-navy-card to-navy-card shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-mint" />
            <h3 className="font-bold text-sm text-navy-heading">Monthly SIWES Check-In for Students on Placement</h3>
          </div>
          <p className="text-xs text-navy-body">
            Stay connected with the Department during your industrial attachment. Need guidance with logbooks or employer challenges?
          </p>
        </div>
        <button
          onClick={() => setCheckInModalOpen(true)}
          className="px-4 py-2 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow shrink-0 min-h-touch flex items-center gap-1.5"
        >
          <Clock className="h-3.5 w-3.5" /> Submit Monthly Check-In
        </button>
      </div>

      {/* DIRECTORY TABS */}
      <div className="flex items-center gap-3 border-b border-navy-border pb-3">
        <button
          onClick={() => setActiveTab("placements")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors min-h-touch flex items-center gap-2 ${
            activeTab === "placements"
              ? "border-mint bg-mint text-navy-onAccent"
              : "border-navy-border bg-navy-card text-navy-body hover:text-navy-heading"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" /> SIWES Placements ({placements.length})
        </button>
        <button
          onClick={() => setActiveTab("alumni")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors min-h-touch flex items-center gap-2 ${
            activeTab === "alumni"
              ? "border-mint bg-mint text-navy-onAccent"
              : "border-navy-border bg-navy-card text-navy-body hover:text-navy-heading"
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" /> Alumni Directory ({alumni.length})
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "placements"
                ? "Search placements by company (Paystack, Flutterwave), stack, or role..."
                : "Search alumni by name, current company, role, or stack..."
            }
            className="w-full rounded-2xl border border-navy-border bg-navy-card py-3 pl-10 pr-4 text-xs md:text-sm text-navy-heading placeholder:text-navy-subtle focus:border-mint focus:outline-none"
          />
        </div>

        {activeTab === "placements" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-navy-subtle">City:</span>
            {placementCities.map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  selectedCity === city
                    ? "border-mint bg-mint/15 text-mint"
                    : "border-navy-border bg-navy-bgStart text-navy-body hover:text-navy-heading"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PLACEMENTS VIEW */}
      {activeTab === "placements" && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-52 rounded-2xl bg-navy-card/40 animate-pulse border border-navy-border" />
              ))}
            </div>
          ) : filteredPlacements.length === 0 ? (
            <div className="text-center py-12 rounded-3xl border border-navy-border bg-navy-card">
              <p className="text-sm text-navy-body">No placements found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlacements.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl border border-navy-border bg-navy-card hover:bg-navy-cardHover transition-colors space-y-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-navy-border pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint/10 border border-mint/20 text-mint font-extrabold text-lg">
                          {item.company.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-navy-heading">{item.company}</h3>
                          <p className="text-xs font-semibold text-mint">{item.role}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-navy-bgStart text-navy-subtle border border-navy-border">
                        {item.level}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-navy-body">
                        <MapPin className="h-3.5 w-3.5 text-mint shrink-0" />
                        <span>{item.city}</span>
                      </div>

                      <div className="flex items-center gap-2 text-navy-body">
                        <Code className="h-3.5 w-3.5 text-mint shrink-0" />
                        <span className="font-mono text-navy-heading font-medium">{item.techStack}</span>
                      </div>

                      {item.howIGotIn && (
                        <div className="text-[11px] text-navy-subtle pt-1">
                          <strong className="text-navy-heading">How I got in:</strong> {item.howIGotIn}
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 rounded-2xl border border-navy-border bg-navy-bgStart space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-mint">
                        <Lightbulb className="h-3.5 w-3.5" /> Interview & Application Advice
                      </div>
                      <p className="text-xs text-navy-body leading-relaxed">{item.tipsToApply}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-navy-border/50 flex items-center justify-between text-[11px] text-navy-subtle">
                    <span>
                      Shared by: <strong className="text-navy-heading">{item.studentName}</strong>
                    </span>

                    <button
                      onClick={() => setRemovalModalTarget({ id: item.id, type: "PLACEMENT", name: `${item.studentName} (${item.company})` })}
                      className="text-navy-subtle hover:text-red-400 transition-colors text-[10px] underline"
                    >
                      Request removal/edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ALUMNI DIRECTORY VIEW */}
      {activeTab === "alumni" && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-52 rounded-2xl bg-navy-card/40 animate-pulse border border-navy-border" />
              ))}
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="text-center py-12 rounded-3xl border border-navy-border bg-navy-card">
              <p className="text-sm text-navy-body">No alumni records found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAlumni.map((alum) => (
                <div
                  key={alum.id}
                  className="p-5 rounded-3xl border border-navy-border bg-navy-card hover:bg-navy-cardHover transition-colors space-y-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-navy-border pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint/10 border border-mint/20 text-mint font-extrabold text-lg">
                          <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-navy-heading">{alum.name}</h3>
                          <p className="text-xs font-semibold text-mint">
                            Class of {alum.graduationYear} &bull; {alum.currentRole}
                          </p>
                        </div>
                      </div>

                      {alum.linkedinUrl && (
                        <a
                          href={alum.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-navy-bgStart hover:bg-mint/10 border border-navy-border hover:border-mint/30 text-mint transition-colors"
                          title="LinkedIn Profile"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-navy-body">
                        <Building2 className="h-3.5 w-3.5 text-mint shrink-0" />
                        <span>
                          Current Company: <strong className="text-navy-heading">{alum.currentCompany}</strong> ({alum.city})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-navy-body">
                        <Code className="h-3.5 w-3.5 text-mint shrink-0" />
                        <span className="font-mono text-navy-heading font-medium">{alum.techStack}</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-navy-border bg-navy-bgStart space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-mint">
                        <Sparkles className="h-3.5 w-3.5" /> Career Advice for NACOSS Undergrads
                      </div>
                      <p className="text-xs text-navy-body leading-relaxed">{alum.advice}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-navy-border/50 flex items-center justify-between text-[11px] text-navy-subtle">
                    <span className="text-[10px]">Alumni Directory Record</span>

                    <button
                      onClick={() => setRemovalModalTarget({ id: alum.id, type: "ALUMNUS", name: `${alum.name} (${alum.currentCompany})` })}
                      className="text-navy-subtle hover:text-red-400 transition-colors text-[10px] underline"
                    >
                      Request removal/edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* MODAL 1: SHARE SIWES PLACEMENT */}
      {placementModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setPlacementModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-navy-border bg-navy-bgStart p-6 shadow-2xl space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
              <h3 className="font-bold text-base text-navy-heading uppercase">
                Share Your SIWES Placement
              </h3>
              <button
                onClick={() => setPlacementModalOpen(false)}
                className="p-2 rounded-full text-navy-body hover:bg-navy-card"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  feedbackMsg.type === "success"
                    ? "bg-mint/15 border-mint/30 text-mint"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {feedbackMsg.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePlacementSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Damilola Adeyemi"
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Level *</label>
                  <select
                    value={pLevel}
                    onChange={(e) => setPLevel(e.target.value)}
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  >
                    <option value="400L">400L</option>
                    <option value="500L">500L</option>
                    <option value="300L">300L</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Company *</label>
                  <input
                    type="text"
                    required
                    value={pCompany}
                    onChange={(e) => setPCompany(e.target.value)}
                    placeholder="e.g. Paystack, Flutterwave"
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Role *</label>
                  <input
                    type="text"
                    required
                    value={pRole}
                    onChange={(e) => setPRole(e.target.value)}
                    placeholder="e.g. Backend Intern"
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Tech Stack *</label>
                  <input
                    type="text"
                    required
                    value={pTechStack}
                    onChange={(e) => setPTechStack(e.target.value)}
                    placeholder="e.g. Node.js, React, SQL"
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">City *</label>
                  <input
                    type="text"
                    required
                    value={pCity}
                    onChange={(e) => setPCity(e.target.value)}
                    placeholder="e.g. Lagos (Yaba)"
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-navy-heading uppercase">How I got in (Optional)</label>
                <input
                  type="text"
                  value={pHowIGotIn}
                  onChange={(e) => setPHowIGotIn(e.target.value)}
                  placeholder="e.g. Direct career page application, LinkedIn outreach, Hackathon referral"
                  className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-navy-heading uppercase">Application & Interview Tips *</label>
                <textarea
                  rows={2}
                  required
                  value={pTips}
                  onChange={(e) => setPTips(e.target.value)}
                  placeholder="What should junior students prepare for? Coding challenges, questions asked..."
                  className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-navy-heading uppercase">Contact Preference</label>
                <select
                  value={pContactPref}
                  onChange={(e) => setPContactPref(e.target.value)}
                  className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                >
                  <option value="none">No direct contact (Anonymous on listing)</option>
                  <option value="LinkedIn only">LinkedIn only</option>
                  <option value="email via the Hub">Email relayed via the Hub</option>
                </select>
              </div>

              {/* PRIVACY NOTE & MANDATORY CONSENT */}
              <div className="p-3.5 rounded-2xl border border-navy-border bg-navy-card/80 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-mint uppercase text-[10px]">
                  <Shield className="h-3.5 w-3.5" /> Privacy & Consent Policy
                </div>
                <p className="text-[11px] text-navy-subtle leading-relaxed">
                  We never collect or store your phone number or home address. Submissions are reviewed by the Secretariat before appearing publicly.
                </p>
                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={pConsent}
                    onChange={(e) => setPConsent(e.target.checked)}
                    className="mt-0.5 rounded border-navy-border text-mint focus:ring-mint"
                  />
                  <span className="text-[11px] text-navy-heading font-medium">
                    I agree to my details being shown to NACOSS students. I can ask for removal anytime.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow min-h-touch flex items-center justify-center gap-2"
              >
                {submitting ? "Submitting..." : "Submit for Executive Review"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: JOIN ALUMNI DIRECTORY */}
      {alumniModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setAlumniModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-navy-border bg-navy-bgStart p-6 shadow-2xl space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
              <h3 className="font-bold text-base text-navy-heading uppercase">
                Join Alumni Directory
              </h3>
              <button
                onClick={() => setAlumniModalOpen(false)}
                className="p-2 rounded-full text-navy-body hover:bg-navy-card"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  feedbackMsg.type === "success"
                    ? "bg-mint/15 border-mint/30 text-mint"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {feedbackMsg.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleAlumniSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={aName}
                    onChange={(e) => setAName(e.target.value)}
                    placeholder="e.g. Student name"
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Graduation Year *</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={aYear}
                    onChange={(e) => setAYear(e.target.value)}
                    placeholder="e.g. 2023"
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Current Company *</label>
                  <input
                    type="text"
                    required
                    value={aCompany}
                    onChange={(e) => setACompany(e.target.value)}
                    placeholder="e.g. Moniepoint, Interswitch"
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Current Role *</label>
                  <input
                    type="text"
                    required
                    value={aRole}
                    onChange={(e) => setARole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Tech Stack *</label>
                  <input
                    type="text"
                    required
                    value={aTechStack}
                    onChange={(e) => setATechStack(e.target.value)}
                    placeholder="e.g. Go, Kubernetes, AWS"
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">City *</label>
                  <input
                    type="text"
                    required
                    value={aCity}
                    onChange={(e) => setACity(e.target.value)}
                    placeholder="e.g. Lagos / London"
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-navy-heading uppercase">LinkedIn Profile URL (Optional)</label>
                <input
                  type="url"
                  value={aLinkedin}
                  onChange={(e) => setALinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-navy-heading uppercase">Career Advice for Students *</label>
                <textarea
                  rows={2}
                  required
                  value={aAdvice}
                  onChange={(e) => setAAdvice(e.target.value)}
                  placeholder="Advice on breaking into the tech industry, skills that matter..."
                  className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none resize-none"
                />
              </div>

              {/* PRIVACY NOTE & MANDATORY CONSENT */}
              <div className="p-3.5 rounded-2xl border border-navy-border bg-navy-card/80 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-mint uppercase text-[10px]">
                  <Shield className="h-3.5 w-3.5" /> Alumni Privacy Guarantee
                </div>
                <p className="text-[11px] text-navy-subtle leading-relaxed">
                  Only the fields provided above will be visible to matriculated NACOSS students. Phone numbers and private contacts will never be requested.
                </p>
                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={aConsent}
                    onChange={(e) => setAConsent(e.target.checked)}
                    className="mt-0.5 rounded border-navy-border text-mint focus:ring-mint"
                  />
                  <span className="text-[11px] text-navy-heading font-medium">
                    I agree to my details being shown to NACOSS students. I can ask for removal anytime.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow min-h-touch flex items-center justify-center gap-2"
              >
                {submitting ? "Submitting..." : "Submit to Alumni Directory"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MONTHLY SIWES CHECK-IN */}
      {checkInModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setCheckInModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-navy-border bg-navy-bgStart p-6 shadow-2xl space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
              <h3 className="font-bold text-base text-navy-heading uppercase">
                Monthly SIWES Check-In
              </h3>
              <button
                onClick={() => setCheckInModalOpen(false)}
                className="p-2 rounded-full text-navy-body hover:bg-navy-card"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  feedbackMsg.type === "success"
                    ? "bg-mint/15 border-mint/30 text-mint"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {feedbackMsg.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCheckInSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-navy-heading uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="e.g. Software Developer"
                  className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Level</label>
                  <select
                    value={cLevel}
                    onChange={(e) => setCLevel(e.target.value)}
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  >
                    <option value="400L">400L</option>
                    <option value="300L">300L</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Current Company</label>
                  <input
                    type="text"
                    required
                    value={cCompany}
                    onChange={(e) => setCCompany(e.target.value)}
                    placeholder="e.g. Kuda Bank"
                    className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-navy-heading uppercase">Current Status</label>
                <select
                  value={cStatus}
                  onChange={(e: any) => setCStatus(e.target.value)}
                  className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                >
                  <option value="STILL_PLACED">Still actively placed & working</option>
                  <option value="COMPLETED">Placement completed successfully</option>
                  <option value="SEEKING_HELP">Facing challenges / Need assistance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-navy-heading uppercase">Notes or Feedback (Optional)</label>
                <textarea
                  rows={2}
                  value={cNotes}
                  onChange={(e) => setCNotes(e.target.value)}
                  placeholder="Any updates on your logbook, supervisor visits, or concerns?"
                  className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-navy-card border border-navy-border">
                <input
                  type="checkbox"
                  checked={cNeedsHelp}
                  onChange={(e) => setCNeedsHelp(e.target.checked)}
                  className="rounded border-navy-border text-mint focus:ring-mint"
                />
                <span className="text-[11px] font-semibold text-navy-heading">
                  Flag this check-in: I need executive help with my attachment
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-xs font-bold text-navy-onAccent bg-mint hover:bg-mint-hover rounded-xl shadow min-h-touch flex items-center justify-center gap-2"
              >
                {submitting ? "Sending..." : "Submit Check-In"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REMOVAL OR EDIT REQUEST */}
      {removalModalTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setRemovalModalTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-navy-border bg-navy-bgStart p-6 shadow-2xl space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-navy-border pb-3">
              <h3 className="font-bold text-base text-navy-heading uppercase">
                Request Removal or Edit
              </h3>
              <button
                onClick={() => setRemovalModalTarget(null)}
                className="p-2 rounded-full text-navy-body hover:bg-navy-card"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-navy-body">
              Listing: <strong className="text-navy-heading">{removalModalTarget.name}</strong>
            </p>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  feedbackMsg.type === "success"
                    ? "bg-mint/15 border-mint/30 text-mint"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                {feedbackMsg.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleRemovalSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-navy-heading uppercase">Reason for Removal or Change *</label>
                <textarea
                  rows={3}
                  required
                  value={rReason}
                  onChange={(e) => setRReason(e.target.value)}
                  placeholder="e.g. Please update my current company, or remove my name from the directory."
                  className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-navy-heading uppercase">Your Email for Confirmation (Optional)</label>
                <input
                  type="email"
                  value={rEmail}
                  onChange={(e) => setREmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-navy-heading focus:border-mint focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl min-h-touch flex items-center justify-center gap-2"
              >
                {submitting ? "Submitting..." : "Send Request to Admin"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
