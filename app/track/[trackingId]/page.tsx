"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  MessageSquare,
  Search,
  Lock,
} from "lucide-react";

interface AuditUpdate {
  id: string;
  status: string;
  note: string;
  createdAt: string;
}

interface ConcernTrackingData {
  trackingId: string;
  category: string;
  status: string; // RECEIVED | BEING_HANDLED | RESOLVED | DECLINED
  publicResponse: string | null;
  targetOfficeSlug: string;
  createdAt: string;
  updatedAt: string;
  updates: AuditUpdate[];
}

export default function TrackingDetailPage({
  params,
}: {
  params: { trackingId: string };
}) {
  const { trackingId } = params;
  const [data, setData] = useState<ConcernTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchTracking() {
      try {
        const res = await fetch(`/api/concerns/${trackingId}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Concern not found");
        }
        setData(json.data);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load tracking data");
      } finally {
        setLoading(false);
      }
    }
    fetchTracking();
  }, [trackingId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return {
          label: "RESOLVED",
          color: "bg-mint/20 text-mint border-mint/40",
          icon: CheckCircle2,
        };
      case "BEING_HANDLED":
        return {
          label: "BEING HANDLED",
          color: "bg-blue-500/20 text-blue-400 border-blue-500/40",
          icon: Clock,
        };
      case "DECLINED":
        return {
          label: "DECLINED",
          color: "bg-red-500/20 text-red-400 border-red-500/40",
          icon: AlertTriangle,
        };
      default:
        return {
          label: "RECEIVED",
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
          icon: Clock,
        };
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-12 text-center">
        <div className="h-48 rounded-3xl bg-navy-card/50 animate-pulse border border-navy-border" />
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-navy-card border border-navy-border text-navy-subtle">
          <Search className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-navy-heading">Tracking ID Not Found</h2>
          <p className="text-xs text-navy-body">
            No concern found matching <strong className="font-mono text-mint">{trackingId}</strong>. Please check your ID and try again.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            href="/track"
            className="px-5 py-2.5 text-xs font-bold text-navy-bgStart bg-mint hover:bg-mint-hover rounded-xl shadow"
          >
            Try Another ID
          </Link>
        </div>
      </div>
    );
  }

  const badge = getStatusBadge(data.status);
  const StatusIcon = badge.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* BACK BUTTON */}
      <Link
        href="/track"
        className="inline-flex items-center gap-1.5 text-xs text-navy-body hover:text-mint transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Search
      </Link>

      {/* TRACKING HEADER CARD */}
      <div className="p-6 rounded-3xl border border-navy-border bg-navy-card space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-border pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-navy-subtle block">
              TRACKING ID
            </span>
            <h1 className="text-2xl font-extrabold font-mono text-mint">{data.trackingId}</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase ${badge.color}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {badge.label}
            </span>
          </div>
        </div>

        {/* METADATA */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-2 text-navy-body">
            <Building2 className="h-4 w-4 text-mint shrink-0" />
            <span>
              Target Office: <strong className="text-navy-heading font-semibold">{data.targetOfficeSlug}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-navy-body">
            <Calendar className="h-4 w-4 text-mint shrink-0" />
            <span>
              Category: <strong className="text-navy-heading font-semibold">{data.category}</strong>
            </span>
          </div>
        </div>

        {/* PRIVACY NOTICE */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-navy-bgStart border border-navy-border text-[11px] text-navy-subtle">
          <Lock className="h-3.5 w-3.5 text-mint shrink-0" />
          <span>
            Privacy Shield Enabled: Student identity and personal contact info are strictly hidden on this public tracking link.
          </span>
        </div>
      </div>

      {/* PUBLIC EXECUTIVE RESPONSE (IF ANY) */}
      {data.publicResponse && (
        <div className="p-5 rounded-2xl border border-mint/40 bg-gradient-to-r from-mint/10 via-navy-card to-navy-card space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-mint uppercase">
            <MessageSquare className="h-4 w-4" /> Official Executive Public Response
          </div>
          <p className="text-xs text-navy-heading leading-relaxed font-medium">
            "{data.publicResponse}"
          </p>
        </div>
      )}

      {/* VERTICAL AUDIT TIMELINE */}
      <div className="p-6 rounded-3xl border border-navy-border bg-navy-card space-y-4">
        <h3 className="text-sm font-bold uppercase text-navy-heading flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-mint" /> Audit Timeline
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-navy-border">
          {data.updates.map((upd, idx) => {
            const updBadge = getStatusBadge(upd.status);
            const UpdIcon = updBadge.icon;

            return (
              <div key={upd.id} className="relative space-y-1">
                {/* Timeline node icon */}
                <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy-bgStart border border-mint text-mint">
                  <UpdIcon className="h-3 w-3" />
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${updBadge.color}`}>
                    {updBadge.label}
                  </span>
                  <span className="text-[10px] font-mono text-navy-subtle">
                    {new Date(upd.createdAt).toLocaleString("en-NG", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                <p className="text-xs text-navy-heading font-medium leading-relaxed">
                  {upd.note}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
