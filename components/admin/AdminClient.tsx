"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Lock,
  Inbox,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogOut,
  Download,
  Share2,
  Copy,
  Check,
  Search,
  Filter,
  MessageSquare,
  Shield,
  Trash2,
  Eye,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { EXECUTIVES_LIST } from "@/config/executives";

interface AuditUpdate {
  id: string;
  status: string;
  note: string;
  createdAt: string;
}

interface Concern {
  id: string;
  trackingId: string;
  category: string;
  subject: string;
  message: string;
  isAnonymous: boolean;
  senderName: string | null;
  senderEmail: string | null;
  level: string | null;
  targetOfficeSlug: string;
  status: string;
  publicResponse: string | null;
  createdAt: string;
  updates: AuditUpdate[];
}

interface SiwesItem {
  id: string;
  studentName: string;
  company: string;
  role: string;
  isApproved: boolean;
  city: string;
  techStack: string;
  createdAt: string;
}

interface AlumniItem {
  id: string;
  name: string;
  currentCompany: string;
  currentRole: string;
  graduationYear: string;
  isApproved: boolean;
  city: string;
  createdAt: string;
}

interface RemovalItem {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  requesterEmail: string | null;
  isResolved: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"concerns" | "announcements" | "moderation">("concerns");

  // Concerns State
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [filteredOffice, setFilteredOffice] = useState("all");
  const [filteredStatus, setFilteredStatus] = useState("all");
  const [selectedConcern, setSelectedConcern] = useState<Concern | null>(null);

  // Status Change State
  const [updatingStatus, setUpdatingStatus] = useState<string>("RECEIVED");
  const [publicResponseText, setPublicResponseText] = useState("");
  const [updateNoteText, setUpdateNoteText] = useState("");
  const [statusActionMsg, setStatusActionMsg] = useState("");

  // Announcement Composer State
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annCategory, setAnnCategory] = useState("General");
  const [annPinned, setAnnPinned] = useState(false);
  const [annOffice, setAnnOffice] = useState("general-secretary");
  const [publishedAnn, setPublishedAnn] = useState<{ id: string; title: string; body: string } | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Moderation State
  const [modPlacements, setModPlacements] = useState<SiwesItem[]>([]);
  const [modAlumni, setModAlumni] = useState<AlumniItem[]>([]);
  const [modRemovals, setModRemovals] = useState<RemovalItem[]>([]);
  const [loadingMod, setLoadingMod] = useState(false);

  // The server page validates the session before this client-side login/chooser UI is rendered.
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth");
        const json = await res.json();
        setIsAuthenticated(Boolean(json.authenticated));
        setSelectedOffice(json.office || null);
        if (json.authenticated && json.office) {
          window.location.assign("/office");
          return;
        }
      } catch (e) {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Login failed");
      }
      setIsAuthenticated(true);
      setSelectedOffice(null);
    } catch (err: any) {
      setLoginError(err.message || "Invalid executive passcode");
    }
  };

  const enterOffice = async (office: string) => {
    setLoginError("");
    try {
      const response = await fetch("/api/admin/auth", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ office }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || "Office selection failed");
      setSelectedOffice(office);
      window.location.assign("/office");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Office selection failed");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setIsAuthenticated(false);
    setSelectedConcern(null);
  };

  const fetchConcerns = useCallback(async () => {
    try {
      const url = new URL("/api/admin/concerns", window.location.origin);
      if (filteredOffice !== "all") url.searchParams.set("office", filteredOffice);
      if (filteredStatus !== "all") url.searchParams.set("status", filteredStatus);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setConcerns(json.data);
      }
    } catch (e) {
      console.error("Failed to load concerns:", e);
    }
  }, [filteredOffice, filteredStatus]);

  useEffect(() => {
    if (isAuthenticated && selectedOffice) {
      fetchConcerns();
    }
  }, [fetchConcerns, isAuthenticated, selectedOffice]);

  const fetchModeration = async () => {
    setLoadingMod(true);
    try {
      const res = await fetch("/api/admin/siwes");
      const json = await res.json();
      if (json.success) {
        setModPlacements(json.data.placements || []);
        setModAlumni(json.data.alumni || []);
        setModRemovals(json.data.removalRequests || []);
      }
    } catch (e) {
      console.error("Failed to load moderation data:", e);
    } finally {
      setLoadingMod(false);
    }
  };

  useEffect(() => {
    if (activeTab === "moderation" && isAuthenticated) {
      fetchModeration();
    }
  }, [activeTab, isAuthenticated]);

  const selectConcernForReview = (c: Concern) => {
    setSelectedConcern(c);
    setUpdatingStatus(c.status);
    setPublicResponseText(c.publicResponse || "");
    setUpdateNoteText("");
    setStatusActionMsg("");
  };

  const handleUpdateConcernStatus = async () => {
    if (!selectedConcern) return;
    if (!updateNoteText.trim()) {
      setStatusActionMsg("Please provide an internal update note for the audit log.");
      return;
    }

    try {
      const res = await fetch("/api/admin/concerns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concernId: selectedConcern.id,
          status: updatingStatus,
          publicResponse: publicResponseText.trim() || null,
          updateNote: updateNoteText.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update");
      }

      setStatusActionMsg("Status and response saved successfully!");
      fetchConcerns();

      // Update active view
      setSelectedConcern((prev) =>
        prev
          ? {
              ...prev,
              status: updatingStatus,
              publicResponse: publicResponseText.trim() || null,
              updates: [
                ...prev.updates,
                {
                  id: "new-" + Date.now(),
                  status: updatingStatus,
                  note: updateNoteText.trim(),
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : null
      );
      setUpdateNoteText("");
    } catch (err: any) {
      setStatusActionMsg(err.message || "Failed to save update");
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: annTitle,
          body: annBody,
          category: annCategory,
          pinned: annPinned,
          authorOfficeSlug: annOffice,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Publish failed");
      setPublishedAnn({
        id: json.data.id,
        title: annTitle,
        body: annBody,
      });
      setAnnTitle("");
      setAnnBody("");
    } catch (e: any) {
      alert(e.message || "Failed to post announcement");
    }
  };

  const handleCopyShare = (type: "whatsapp" | "social" | "link") => {
    if (!publishedAnn) return;
    const origin = window.location.origin;
    if (type === "whatsapp") {
      const text = `🚨 *NACOS UNILAG OFFICIAL ANNOUNCEMENT*\n\n📌 *${publishedAnn.title}*\n\n${publishedAnn.body}\n\n🔗 View on NACOS Hub: ${origin}/announcements/${publishedAnn.id}\n\n#NACOSUNILAG`;
      navigator.clipboard.writeText(text);
    } else if (type === "social") {
      const text = `📢 NACOS UNILAG: ${publishedAnn.title}\n\n${publishedAnn.body.substring(0, 180)}...\n\nRead more on NACOS Hub: ${origin}/announcements/${publishedAnn.id}\n#NACOSUNILAG`;
      navigator.clipboard.writeText(text);
    } else {
      navigator.clipboard.writeText(`${origin}/announcements/${publishedAnn.id}`);
    }
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const toggleApproval = async (type: "placement" | "alumni", id: string, current: boolean) => {
    try {
      await fetch("/api/admin/siwes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-approval",
          type,
          id,
          isApproved: !current,
        }),
      });
      fetchModeration();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteItem = async (type: "placement" | "alumni", id: string) => {
    if (!confirm("Are you sure you want to permanently delete this record?")) return;
    try {
      await fetch(`/api/admin/siwes?type=${type}&id=${id}`, { method: "DELETE" });
      fetchModeration();
    } catch (e) {
      console.error(e);
    }
  };

  const resolveRemoval = async (id: string, current: boolean) => {
    try {
      await fetch("/api/admin/siwes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve-removal",
          id,
          isResolved: !current,
        }),
      });
      fetchModeration();
    } catch (e) {
      console.error(e);
    }
  };

  // LOADING SCREEN
  if (isAuthenticated === null) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="h-8 w-8 border-2 border-mint border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-navy-body">Checking executive session...</p>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 border border-mint/20 px-3 py-1 text-xs font-semibold text-mint">
            <Lock className="h-3.5 w-3.5" />
            Executive Administration Portal
          </div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-navy-heading">
            Executive Login
          </h1>
          <p className="text-xs text-navy-body">
            Enter the executive demo passcode to access the concern inbox and announcement composer.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="p-6 rounded-3xl border border-navy-border bg-navy-card space-y-4 shadow-xl"
        >
          {loginError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {loginError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-navy-heading">Executive Passcode</label>
            <input
              type="password"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode from ADMIN_PASSCODE"
              className="w-full rounded-xl border border-navy-border bg-navy-bgStart p-3 text-xs text-navy-heading focus:border-mint focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-xs font-bold text-navy-bgStart bg-mint hover:bg-mint-hover rounded-xl shadow min-h-touch flex items-center justify-center gap-2"
          >
            Access Executive Workspace
          </button>

          <p className="text-[10px] text-navy-subtle text-center">
            Demo notice: Authenticates via secure httpOnly signed session cookie. In production, this is replaced by per-executive credentials.
          </p>
        </form>
      </div>
    );
  }

  if (!selectedOffice) {
    return (
      <section className="mx-auto max-w-4xl space-y-6 py-8">
        <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-center">
          <strong className="text-sm tracking-widest text-amber-300">DEMO MODE</strong>
          <p className="mt-1 text-xs text-navy-body">
            Shared passcode access is temporary. Per-executive accounts will replace demo office selection.
          </p>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-navy-heading">Enter an Office</h1>
          <p className="mt-1 text-sm text-navy-body">Choose an office workspace for this session.</p>
        </div>
        {loginError && <p role="alert" className="text-sm text-red-400">{loginError}</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXECUTIVES_LIST.map((executive) => (
            <button
              key={executive.officeSlug}
              type="button"
              onClick={() => enterOffice(executive.officeSlug)}
              className="min-h-touch rounded-xl border border-navy-border bg-navy-card p-4 text-left hover:border-mint"
            >
              <span className="block font-bold text-navy-heading">{executive.position}</span>
              <span className="mt-1 block text-xs text-navy-body">Enter office workspace</span>
            </button>
          ))}
        </div>
        <button onClick={handleLogout} className="text-sm text-navy-body underline hover:text-mint">
          Log out
        </button>
      </section>
    );
  }

  // AUTHENTICATED DASHBOARD
  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-mint animate-pulse" />
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-navy-heading">
              Executive Console
            </h1>
          </div>
          <p className="text-xs text-navy-body">
            Manage routed concerns, reply to students publicly, publish broadcasts, and moderate SIWES.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/about"
            className="px-3 py-1.5 rounded-xl border border-navy-border bg-navy-card text-xs text-navy-body hover:text-navy-heading transition-colors"
          >
            About Prototype
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl border border-navy-border hover:border-red-500/40 bg-navy-card hover:bg-red-500/10 text-xs text-navy-body hover:text-red-400 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab("concerns")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
            activeTab === "concerns"
              ? "border-mint bg-mint text-navy-bgStart"
              : "border-navy-border bg-navy-card text-navy-body hover:text-navy-heading"
          }`}
        >
          <Inbox className="h-4 w-4" /> Concern Inbox ({concerns.length})
        </button>

        <button
          onClick={() => setActiveTab("announcements")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
            activeTab === "announcements"
              ? "border-mint bg-mint text-navy-bgStart"
              : "border-navy-border bg-navy-card text-navy-body hover:text-navy-heading"
          }`}
        >
          <Bell className="h-4 w-4" /> Announcement Composer
        </button>

        <button
          onClick={() => setActiveTab("moderation")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 ${
            activeTab === "moderation"
              ? "border-mint bg-mint text-navy-bgStart"
              : "border-navy-border bg-navy-card text-navy-body hover:text-navy-heading"
          }`}
        >
          <Briefcase className="h-4 w-4" /> Placements & Alumni Queue
        </button>
      </div>

      {/* TAB 1: CONCERN INBOX */}
      {activeTab === "concerns" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: INBOX LIST */}
          <div className="lg:col-span-5 space-y-4">
            {/* FILTERS */}
            <div className="p-4 rounded-2xl border border-navy-border bg-navy-card space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-mint">
                <Filter className="h-3.5 w-3.5" /> Filter Inbox
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-navy-subtle uppercase block mb-1">Office</label>
                  <select
                    value={filteredOffice}
                    onChange={(e) => setFilteredOffice(e.target.value)}
                    className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-2 text-xs text-navy-heading"
                  >
                    <option value="all">All 12 Offices</option>
                    <option value="general-secretary">General Secretary</option>
                    <option value="director-of-academics">Director of Academics</option>
                    <option value="welfare-director">Welfare Director</option>
                    <option value="financial-secretary">Financial Secretary</option>
                    <option value="director-of-software">Director of Software</option>
                    <option value="pro">PRO</option>
                    <option value="social-director">Social Director</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-navy-subtle uppercase block mb-1">Status</label>
                  <select
                    value={filteredStatus}
                    onChange={(e) => setFilteredStatus(e.target.value)}
                    className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-2 text-xs text-navy-heading"
                  >
                    <option value="all">All Statuses</option>
                    <option value="RECEIVED">Received</option>
                    <option value="BEING_HANDLED">Being Handled</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="DECLINED">Declined</option>
                  </select>
                </div>
              </div>
            </div>

            {/* LIST ITEMS */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {concerns.length === 0 ? (
                <div className="text-center py-10 rounded-2xl border border-navy-border bg-navy-card text-xs text-navy-body">
                  No concerns match the selected filters.
                </div>
              ) : (
                concerns.map((c) => {
                  const isSelected = selectedConcern?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => selectConcernForReview(c)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2 ${
                        isSelected
                          ? "border-mint bg-mint/10 shadow-md"
                          : "border-navy-border bg-navy-card hover:bg-navy-cardHover"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-mint">{c.trackingId}</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            c.status === "RESOLVED"
                              ? "bg-mint/20 text-mint border-mint/30"
                              : c.status === "BEING_HANDLED"
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : c.status === "DECLINED"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-navy-heading line-clamp-1">{c.subject}</h4>

                      <div className="flex items-center justify-between text-[10px] text-navy-subtle">
                        <span>Office: {c.targetOfficeSlug}</span>
                        <span>{c.isAnonymous ? "🔒 Anonymous" : `👤 ${c.senderName || "Named"}`}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: DETAIL VIEW & RESPONSE ACTION */}
          <div className="lg:col-span-7">
            {selectedConcern ? (
              <div className="p-6 rounded-3xl border border-navy-border bg-navy-card space-y-6 shadow-xl">
                <div className="flex items-start justify-between border-b border-navy-border pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-mint uppercase tracking-wider block">
                      TRACKING ID: {selectedConcern.trackingId}
                    </span>
                    <h2 className="text-lg font-bold text-navy-heading mt-1">{selectedConcern.subject}</h2>
                    <span className="text-xs text-navy-subtle">
                      Category: {selectedConcern.category} &bull; Target Office: {selectedConcern.targetOfficeSlug}
                    </span>
                  </div>

                  <Link
                    href={`/track/${selectedConcern.trackingId}`}
                    target="_blank"
                    className="text-xs text-mint hover:underline font-semibold flex items-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" /> Student View
                  </Link>
                </div>

                {/* SENDER IDENTITY (EXECUTIVE VIEW ONLY) */}
                <div className="p-4 rounded-2xl border border-navy-border bg-navy-bgStart space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-navy-heading">
                    <Shield className="h-4 w-4 text-mint" /> Sender Identity (Confidential)
                  </div>
                  {selectedConcern.isAnonymous ? (
                    <p className="text-xs text-mint font-semibold">
                      🔒 Submitted Anonymously (Level: {selectedConcern.level || "Unspecified"}). Identity was not recorded.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-xs text-navy-body">
                      <div>Name: <strong className="text-navy-heading">{selectedConcern.senderName || "N/A"}</strong></div>
                      <div>Level: <strong className="text-navy-heading">{selectedConcern.level || "N/A"}</strong></div>
                      <div className="col-span-2">
                        Email: <strong className="text-navy-heading">{selectedConcern.senderEmail || "None provided"}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* MESSAGE BODY */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-navy-subtle uppercase">Full Concern Message</span>
                  <div className="p-4 rounded-2xl border border-navy-border bg-navy-bgStart text-xs text-navy-heading leading-relaxed whitespace-pre-wrap">
                    {selectedConcern.message}
                  </div>
                </div>

                {/* STATUS CHANGER & PUBLIC RESPONSE */}
                <div className="p-5 rounded-2xl border border-mint/30 bg-mint/5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-mint uppercase">
                    <MessageSquare className="h-4 w-4" /> Executive Action & Response
                  </div>

                  {statusActionMsg && (
                    <div className="p-3 rounded-xl bg-mint/20 border border-mint/40 text-xs text-mint">
                      {statusActionMsg}
                    </div>
                  )}

                  {/* STATUS BUTTONS */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-navy-subtle">Set Status</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: "Received", val: "RECEIVED" },
                        { label: "Being Handled", val: "BEING_HANDLED" },
                        { label: "Resolved", val: "RESOLVED" },
                        { label: "Declined", val: "DECLINED" },
                      ].map((st) => (
                        <button
                          key={st.val}
                          type="button"
                          onClick={() => setUpdatingStatus(st.val)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                            updatingStatus === st.val
                              ? "border-mint bg-mint text-navy-bgStart"
                              : "border-navy-border bg-navy-card text-navy-body hover:text-navy-heading"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PUBLIC RESPONSE FIELD */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-navy-subtle">
                      Public Response (Appears on Student&apos;s Tracking Page)
                    </label>
                    <textarea
                      rows={3}
                      value={publicResponseText}
                      onChange={(e) => setPublicResponseText(e.target.value)}
                      placeholder="e.g. The Directorate has met with the HOD and the lab session has been moved to Wednesday 8 AM."
                      className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-xs text-navy-heading focus:border-mint focus:outline-none resize-none"
                    />
                  </div>

                  {/* AUDIT LOG NOTE */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-navy-subtle">
                      Audit Trail Note (Logged in ConcernUpdate table) *
                    </label>
                    <input
                      type="text"
                      value={updateNoteText}
                      onChange={(e) => setUpdateNoteText(e.target.value)}
                      placeholder="e.g. Liaison meeting held with GST course coordinator"
                      className="w-full rounded-xl border border-navy-border bg-navy-card p-3 text-xs text-navy-heading focus:border-mint focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleUpdateConcernStatus}
                    className="w-full py-3 text-xs font-bold text-navy-bgStart bg-mint hover:bg-mint-hover rounded-xl shadow min-h-touch flex items-center justify-center gap-2"
                  >
                    Save Status Change & Post Public Response
                  </button>
                </div>

                {/* AUDIT TIMELINE PREVIEW */}
                <div className="space-y-2 pt-2 border-t border-navy-border">
                  <span className="text-xs font-bold uppercase text-navy-subtle">Audit Trail History</span>
                  <div className="space-y-2">
                    {selectedConcern.updates.map((u) => (
                      <div key={u.id} className="p-3 rounded-xl bg-navy-bgStart border border-navy-border text-xs flex justify-between items-start">
                        <div>
                          <span className="font-bold text-mint uppercase text-[10px] block">{u.status}</span>
                          <span className="text-navy-heading">{u.note}</span>
                        </div>
                        <span className="text-[10px] text-navy-subtle font-mono">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl border border-navy-border bg-navy-card text-navy-body text-xs">
                Select a concern from the left inbox to view details, update status, and write a public response.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENT COMPOSER */}
      {activeTab === "announcements" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl border border-navy-border bg-navy-card space-y-4 shadow-xl">
              <h2 className="text-base font-bold uppercase text-navy-heading">Draft New Announcement</h2>

              <form onSubmit={handlePublishAnnouncement} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Announcement Title</label>
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="e.g. CSC 301 Mid-Semester Test Rescheduled"
                    className="w-full rounded-xl border border-navy-border bg-navy-bgStart p-3 text-navy-heading focus:border-mint focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-navy-heading uppercase">Category</label>
                    <select
                      value={annCategory}
                      onChange={(e) => setAnnCategory(e.target.value)}
                      className="w-full rounded-xl border border-navy-border bg-navy-bgStart p-3 text-navy-heading focus:border-mint focus:outline-none"
                    >
                      <option value="General">General</option>
                      <option value="Academic">Academic</option>
                      <option value="Event">Event</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Deadline">Deadline</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-navy-heading uppercase">Author Office</label>
                    <select
                      value={annOffice}
                      onChange={(e) => setAnnOffice(e.target.value)}
                      className="w-full rounded-xl border border-navy-border bg-navy-bgStart p-3 text-navy-heading focus:border-mint focus:outline-none"
                    >
                      <option value="general-secretary">General Secretary</option>
                      <option value="pro">PRO</option>
                      <option value="director-of-academics">Director of Academics</option>
                      <option value="director-of-software">Director of Software</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-navy-heading uppercase">Announcement Body</label>
                  <textarea
                    rows={6}
                    required
                    value={annBody}
                    onChange={(e) => setAnnBody(e.target.value)}
                    placeholder="Full announcement content..."
                    className="w-full rounded-xl border border-navy-border bg-navy-bgStart p-3 text-navy-heading focus:border-mint focus:outline-none resize-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annPinned}
                    onChange={(e) => setAnnPinned(e.target.checked)}
                    className="rounded border-navy-border text-mint focus:ring-mint"
                  />
                  <span className="font-semibold text-navy-heading">Pin this announcement to top of feed</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 text-xs font-bold text-navy-bgStart bg-mint hover:bg-mint-hover rounded-xl shadow min-h-touch"
                >
                  Publish Announcement
                </button>
              </form>
            </div>
          </div>

          {/* SHARE KIT */}
          <div className="md:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl border border-navy-border bg-navy-card space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold uppercase text-navy-heading">Announcement Share Kit</h3>
                <span className="text-[10px] font-bold text-mint bg-mint/10 border border-mint/20 px-2 py-0.5 rounded-full">
                  Instant Copy
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 text-[11px] text-yellow-300">
                ⚠️ <strong>PRO Notice:</strong> Auto-posting directly to WhatsApp student groups is not available. Use the 1-click formatted copy buttons below to paste cleanly into departmental groups.
              </div>

              {publishedAnn ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-navy-bgStart border border-navy-border">
                    <span className="text-[10px] text-navy-subtle uppercase block">Active Item</span>
                    <h4 className="font-bold text-sm text-navy-heading line-clamp-1">{publishedAnn.title}</h4>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleCopyShare("whatsapp")}
                      className="w-full p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-between transition-colors"
                    >
                      <span>Copy WhatsApp Formatted (Bold + Emojis)</span>
                      {copiedType === "whatsapp" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={() => handleCopyShare("social")}
                      className="w-full p-3.5 rounded-2xl border border-navy-border bg-navy-bgStart hover:bg-navy-cardHover text-navy-heading font-bold text-xs flex items-center justify-between transition-colors"
                    >
                      <span>Copy Instagram / X (Shortened version)</span>
                      {copiedType === "social" ? <Check className="h-4 w-4 text-mint" /> : <Copy className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={() => handleCopyShare("link")}
                      className="w-full p-3.5 rounded-2xl border border-navy-border bg-navy-bgStart hover:bg-navy-cardHover text-navy-heading font-bold text-xs flex items-center justify-between transition-colors"
                    >
                      <span>Copy Direct Portal URL Link</span>
                      {copiedType === "link" ? <Check className="h-4 w-4 text-mint" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-navy-body py-6 text-center">
                  Publish an announcement or choose an existing one to generate ready-to-copy WhatsApp and social versions.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PLACEMENTS & ALUMNI MODERATION */}
      {activeTab === "moderation" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-navy-border bg-navy-card">
            <div>
              <h3 className="font-bold text-sm text-navy-heading uppercase">SIWES & Alumni Approval Queue</h3>
              <p className="text-xs text-navy-body">
                Review student placement submissions, alumni registrations, and removal requests before they go live.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/admin/export?type=placements"
                className="px-3 py-2 rounded-xl bg-mint text-navy-bgStart text-xs font-bold hover:bg-mint-hover transition-colors flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Export Placements CSV
              </a>
              <a
                href="/api/admin/export?type=alumni"
                className="px-3 py-2 rounded-xl border border-navy-border bg-navy-bgStart text-navy-heading text-xs font-semibold hover:border-mint transition-colors flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5 text-mint" /> Export Alumni CSV
              </a>
            </div>
          </div>

          {/* SECTION 1: SIWES PLACEMENTS */}
          <div className="p-5 rounded-3xl border border-navy-border bg-navy-card space-y-4">
            <h4 className="font-bold text-sm text-navy-heading uppercase flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-mint" /> SIWES Placements ({modPlacements.length})
            </h4>

            <div className="space-y-2">
              {modPlacements.map((p) => (
                <div key={p.id} className="p-3.5 rounded-2xl border border-navy-border bg-navy-bgStart flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-navy-heading">{p.studentName}</strong>
                      <span className="text-navy-subtle">&bull; {p.company} ({p.role})</span>
                    </div>
                    <span className="text-[11px] text-navy-body font-mono">{p.city} | Stack: {p.techStack}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleApproval("placement", p.id, p.isApproved)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                        p.isApproved
                          ? "bg-mint/20 text-mint border border-mint/40"
                          : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                      }`}
                    >
                      {p.isApproved ? "Approved ✓" : "Pending Approval"}
                    </button>
                    <button
                      onClick={() => deleteItem("placement", p.id)}
                      className="p-1.5 text-navy-subtle hover:text-red-400"
                      title="Delete placement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: ALUMNI DIRECTORY */}
          <div className="p-5 rounded-3xl border border-navy-border bg-navy-card space-y-4">
            <h4 className="font-bold text-sm text-navy-heading uppercase flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-mint" /> Alumni Directory ({modAlumni.length})
            </h4>

            <div className="space-y-2">
              {modAlumni.map((a) => (
                <div key={a.id} className="p-3.5 rounded-2xl border border-navy-border bg-navy-bgStart flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-navy-heading">{a.name}</strong>
                      <span className="text-navy-subtle">&bull; Class of {a.graduationYear}</span>
                    </div>
                    <span className="text-[11px] text-navy-body font-mono">{a.currentCompany} ({a.currentRole})</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleApproval("alumni", a.id, a.isApproved)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                        a.isApproved
                          ? "bg-mint/20 text-mint border border-mint/40"
                          : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                      }`}
                    >
                      {a.isApproved ? "Approved ✓" : "Pending Approval"}
                    </button>
                    <button
                      onClick={() => deleteItem("alumni", a.id)}
                      className="p-1.5 text-navy-subtle hover:text-red-400"
                      title="Delete alumnus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: REMOVAL REQUESTS */}
          <div className="p-5 rounded-3xl border border-navy-border bg-navy-card space-y-4">
            <h4 className="font-bold text-sm text-navy-heading uppercase flex items-center gap-2">
              <Shield className="h-4 w-4 text-mint" /> Removal & Edit Requests ({modRemovals.length})
            </h4>

            {modRemovals.length === 0 ? (
              <p className="text-xs text-navy-body">No pending removal or edit requests.</p>
            ) : (
              <div className="space-y-2">
                {modRemovals.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-2xl border border-navy-border bg-navy-bgStart flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-mint uppercase text-[10px] block">
                        Type: {r.targetType} (ID: {r.targetId})
                      </span>
                      <p className="text-navy-heading mt-0.5">&quot;{r.reason}&quot;</p>
                      {r.requesterEmail && (
                        <span className="text-[10px] text-navy-subtle">Email: {r.requesterEmail}</span>
                      )}
                    </div>

                    <button
                      onClick={() => resolveRemoval(r.id, r.isResolved)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 ${
                        r.isResolved
                          ? "bg-mint/20 text-mint border border-mint/40"
                          : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                      }`}
                    >
                      {r.isResolved ? "Resolved ✓" : "Mark Resolved"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
