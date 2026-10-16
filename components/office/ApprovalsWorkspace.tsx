"use client";

import { useState } from "react";

interface ApprovalItem {
  id: string;
  type: string;
  payload: string;
  makerOffice: string;
  requiredApprovers: string;
  approvalMode: string;
  status: string;
  reason: string | null;
  expiresAt: string;
  decisions: Array<{ office: string; decision: string; reason: string | null }>;
}

export default function ApprovalsWorkspace({
  initialRequests,
  canDecide,
  office,
}: {
  initialRequests: ApprovalItem[];
  canDecide: boolean;
  office: string;
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [message, setMessage] = useState("");

  async function submitAction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/office/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.get("type"),
        payload: { title: form.get("title"), description: form.get("description"), amount: form.get("amount") },
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Could not submit request");
      return;
    }
    setMessage("Submitted for approval. Approvers have been notified.");
    window.location.reload();
  }

  async function decide(requestId: string, decision: "APPROVED" | "REJECTED", reason?: string) {
    const response = await fetch("/api/office/approvals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, decision, reason }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Could not record decision");
      return;
    }
    setMessage(decision === "APPROVED" ? "Approval recorded." : "Request rejected.");
    setRequests((items) => items.map((item) => item.id === requestId ? { ...item, status: result.data.status } : item));
  }

  function reject(requestId: string) {
    const reason = window.prompt("Reason for rejection (required):")?.trim();
    if (reason) void decide(requestId, "REJECTED", reason);
    else setMessage("Rejection cancelled; a reason is required.");
  }

  return (
    <div className="space-y-5">
      {message && <p role="status" className="text-sm text-navy-body">{message}</p>}
      <form onSubmit={submitAction} className="grid gap-3 rounded-2xl border border-navy-border bg-navy-card p-5 md:grid-cols-2">
        <h2 className="md:col-span-2 font-bold text-navy-heading">Submit a serious action</h2>
        <select name="type" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm">
          <option value="GENERAL_ACTION">General serious action</option>
          <option value="OFFICIAL_ANNOUNCEMENT">Official announcement</option>
          <option value="URGENT_ANNOUNCEMENT">Urgent announcement</option>
          <option value="SPENDING">Spending request</option>
          <option value="OFFICE_ACTIVATION">Activate / deactivate office</option>
          <option value="ROLE_CHANGE">Change roles</option>
          <option value="FULL_STUDENT_DATA_EXPORT">Full student data export</option>
        </select>
        <input name="title" required minLength={3} placeholder="Action title" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <textarea name="description" rows={3} placeholder="Action details (or announcement body)" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm md:col-span-2" />
        <input name="amount" type="number" min="0.01" step="0.01" placeholder="Amount for spending requests" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <button className="min-h-touch rounded-xl bg-mint px-5 font-bold text-navy-onAccent md:col-span-2">Submit for approval</button>
      </form>

      <div className="space-y-3">
        {requests.map((request) => {
          const payload = JSON.parse(request.payload) as Record<string, unknown>;
          const approvers = JSON.parse(request.requiredApprovers) as string[];
          const alreadyDecided = request.decisions.some((decision) => decision.office === office);
          return (
            <article key={request.id} className="rounded-2xl border border-navy-border bg-navy-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-navy-heading">{String(payload.title ?? request.type.replaceAll("_", " "))}</h2>
                  <p className="mt-1 text-xs text-navy-body">From {request.makerOffice} · Approvers: {approvers.join(request.approvalMode === "ALL" ? " + " : " or ")}</p>
                  <p className="mt-1 text-xs text-navy-subtle">Expires {new Date(request.expiresAt).toLocaleString()}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${request.status === "PENDING" ? "bg-amber-400/10 text-amber-300" : "bg-mint/10 text-mint"}`}>{request.status}</span>
              </div>
              {typeof payload.description === "string" && <p className="mt-3 text-sm text-navy-body">{payload.description}</p>}
              {request.decisions.length > 0 && <p className="mt-3 text-xs text-navy-subtle">{request.decisions.map((item) => `${item.office}: ${item.decision.toLowerCase()}`).join(" · ")}</p>}
              {request.type === "FULL_STUDENT_DATA_EXPORT" && request.status === "APPROVED" && request.makerOffice === office && (
                <a href={`/api/admin/export?requestId=${encodeURIComponent(request.id)}`} className="mt-3 inline-block text-sm font-semibold text-mint underline">
                  Download approved export
                </a>
              )}
              {canDecide && request.status === "PENDING" && approvers.includes(office) && !alreadyDecided && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => void decide(request.id, "APPROVED")} className="min-h-touch rounded-lg bg-mint px-4 text-xs font-bold text-navy-onAccent">Approve</button>
                  <button onClick={() => reject(request.id)} className="min-h-touch rounded-lg border border-red-400/40 px-4 text-xs text-red-300">Reject</button>
                </div>
              )}
            </article>
          );
        })}
        {!requests.length && <p className="text-sm text-navy-body">No approval requests for this office.</p>}
      </div>
    </div>
  );
}
