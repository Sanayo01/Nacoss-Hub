"use client";

import { useState } from "react";

interface ConcernItem {
  id: string;
  trackingId: string;
  subject: string;
  message: string;
  isAnonymous: boolean;
  senderName: string | null;
  senderEmail: string | null;
  status: string;
  createdAt: string;
}

export default function ConcernsWorkspace({ initialConcerns, canManage }: { initialConcerns: ConcernItem[]; canManage: boolean }) {
  const [concerns, setConcerns] = useState(initialConcerns);
  const [message, setMessage] = useState("");

  async function updateStatus(form: FormData, concern: ConcernItem) {
    const response = await fetch("/api/admin/concerns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        concernId: concern.id,
        status: form.get("status"),
        updateNote: form.get("updateNote"),
        publicResponse: form.get("publicResponse") || null,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Could not update concern");
      return;
    }
    setConcerns((items) => items.map((item) => item.id === concern.id ? { ...item, status: String(form.get("status")) } : item));
    setMessage("Concern status updated and recorded in the audit chain.");
  }

  return (
    <div className="space-y-3">
      {message && <p role="status" className="text-sm text-navy-body">{message}</p>}
      {concerns.map((concern) => (
        <article key={concern.id} className="rounded-2xl border border-navy-border bg-navy-card p-5">
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              <h2 className="font-bold text-navy-heading">{concern.subject}</h2>
              <p className="mt-1 text-xs text-navy-body">{concern.trackingId} · {concern.status.replaceAll("_", " ")} · {new Date(concern.createdAt).toLocaleString()}</p>
            </div>
            {concern.isAnonymous
              ? <span className="text-xs text-mint">Anonymous sender</span>
              : <span className="text-xs text-navy-body">{concern.senderName ?? "Student"}{concern.senderEmail ? ` · ${concern.senderEmail}` : ""}</span>}
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-navy-body">{concern.message}</p>
          {canManage && (
            <form onSubmit={(event) => {
              event.preventDefault();
              void updateStatus(new FormData(event.currentTarget), concern);
            }} className="mt-4 grid gap-2 rounded-xl border border-navy-border p-3 md:grid-cols-2">
              <select name="status" defaultValue={concern.status} className="rounded-lg bg-navy-bgStart p-2 text-sm">
                <option value="RECEIVED">Received</option>
                <option value="BEING_HANDLED">Being handled</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DECLINED">Declined</option>
              </select>
              <input name="updateNote" required minLength={3} placeholder="Internal audit note" className="rounded-lg bg-navy-bgStart p-2 text-sm" />
              <textarea name="publicResponse" placeholder="Public response (optional)" className="rounded-lg bg-navy-bgStart p-2 text-sm md:col-span-2" />
              <button className="min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-bgStart md:col-span-2">Save status</button>
            </form>
          )}
        </article>
      ))}
      {!concerns.length && <p className="rounded-2xl border border-navy-border p-5 text-sm text-navy-body">No active concerns assigned to this office.</p>}
    </div>
  );
}
