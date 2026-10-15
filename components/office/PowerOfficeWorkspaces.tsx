"use client";

import { useState } from "react";
import { EXECUTIVES_LIST } from "@/config/executives";

type Score = {
  office: string; position: string; resolvedConcerns: number; averageResponseHours: number | null;
  tasksDone: number; tasksOverdue: number; attendance: number; reportsSubmitted: number;
};
type Motion = {
  id: string; meetingId: string; title: string; description: string; quorumPercent: number;
  status: string; result: string | null; votes: Array<{ office: string; vote: string }>;
};
type MeetingOption = { id: string; title: string; date: string; rsvps?: Array<{ office: string; response: string | null }> };
type Delegation = {
  id: string; startsAt: string; endsAt: string; status: string; delegateOffice: string;
};
type CoordinationOffice = {
  office: string; position: string; tasks: Array<{ id: string; title: string; dueDate: string | null }>;
  meetings: Array<{ id: string; title: string; date: string }>;
};
type Committee = { id: string; name: string; description: string; members: Array<{ office: string }> };

async function post(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed");
  return result.data;
}

function Message({ children }: { children: string }) {
  return children ? <p role="status" className="rounded-lg border border-navy-border p-3 text-sm text-navy-body">{children}</p> : null;
}

export function PresidentWorkspace({
  scorecard, delegations, meetings, motions, pendingApprovals, office, canDelegate,
}: { scorecard: Score[]; delegations: Delegation[]; meetings: MeetingOption[]; motions: Motion[]; office: string; canDelegate: boolean; pendingApprovals: Array<{
  id: string; type: string; makerOffice: string; payload: string; canDecide: boolean;
}> }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<unknown>) {
    setBusy(true); setMessage("");
    try { await action(); window.location.reload(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Action failed"); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5">
    <Message>{message}</Message>
    <section className="rounded-2xl border border-navy-border bg-navy-card p-5">
      <h2 className="mb-3 font-bold text-navy-heading">Meeting attendance</h2>
      <div className="space-y-3">{meetings.slice(0, 10).map((meeting) => <article key={meeting.id} className="border-b border-navy-border pb-3 last:border-0">
        <strong className="text-sm text-navy-heading">{meeting.title}</strong><p className="text-xs text-navy-subtle">{new Date(meeting.date).toLocaleString()}</p>
        <p className="mt-1 text-xs text-navy-body">{(meeting.rsvps ?? []).map((rsvp) => `${rsvp.office}: ${rsvp.response ?? "No response"}`).join(" · ")}</p>
      </article>)}</div>
      {!meetings.length && <p className="text-sm text-navy-subtle">No meetings scheduled.</p>}
    </section>
    <section className="rounded-2xl border border-navy-border bg-navy-card p-5">
      <h2 className="mb-3 font-bold text-navy-heading">Pending serious actions</h2>
      <div className="space-y-2">{pendingApprovals.map((item) => <article key={item.id} className="rounded-xl border border-navy-border p-3">
        <div className="flex flex-wrap justify-between gap-2"><strong className="text-sm text-navy-heading">{item.type.replaceAll("_", " ")}</strong><span className="text-xs text-navy-subtle">from {item.makerOffice}</span></div>
        <p className="mt-2 break-words text-xs text-navy-body">{String((JSON.parse(item.payload) as Record<string, unknown>).title ?? "")}</p>
        {item.canDecide ? <button disabled={busy} onClick={() => void run(() => fetch("/api/office/approvals", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: item.id, decision: "APPROVED" }),
        }).then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); return result; }))} className="mt-2 min-h-touch rounded-lg bg-mint px-3 text-xs font-bold text-navy-bgStart">Approve</button> :
          <p className="mt-2 text-[10px] text-navy-subtle">Awaiting another required office.</p>}
      </article>)}</div>
      {!pendingApprovals.length && <p className="text-sm text-navy-subtle">No pending actions.</p>}
    </section>
    <form onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      void run(() => post("/api/office/approvals", {
        type: "OFFICIAL_ANNOUNCEMENT",
        payload: {
          title: form.get("announcementTitle"), body: form.get("announcementBody"),
          category: form.get("category"), pinned: form.get("pinned") === "on",
        },
      }));
    }} className="grid gap-3 rounded-2xl border border-navy-border bg-navy-card p-5 md:grid-cols-2">
      <h2 className="font-bold text-navy-heading md:col-span-2">Broadcast official announcement</h2>
      <input required name="announcementTitle" minLength={3} placeholder="Announcement title" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <select name="category" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm">{["General", "Academic", "Event", "Deadline"].map((item) => <option key={item}>{item}</option>)}</select>
      <textarea required name="announcementBody" minLength={10} placeholder="Message to all executives" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm md:col-span-2" />
      <label className="flex gap-2 text-xs text-navy-body"><input type="checkbox" name="pinned" /> Pin announcement</label>
      <button disabled={busy} className="min-h-touch rounded-xl bg-mint px-4 font-bold text-navy-bgStart md:col-span-2">Submit announcement for approval</button>
    </form>
    <section className="rounded-2xl border border-navy-border bg-navy-card p-5">
      <h2 className="mb-3 font-bold text-navy-heading">Executive scorecard</h2>
      <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm">
        <thead className="text-xs text-navy-subtle"><tr>{["Office", "Concerns resolved", "Avg response (h)", "Tasks done", "Overdue", "Attendance", "Reports"].map((item) => <th className="p-2" key={item}>{item}</th>)}</tr></thead>
        <tbody>{scorecard.map((item) => <tr key={item.office} className="border-t border-navy-border">
          <td className="p-2 text-navy-heading">{item.position}</td><td className="p-2">{item.resolvedConcerns}</td>
          <td className="p-2">{item.averageResponseHours?.toFixed(1) ?? "—"}</td><td className="p-2">{item.tasksDone}</td>
          <td className="p-2">{item.tasksOverdue}</td><td className="p-2">{item.attendance}</td><td className="p-2">{item.reportsSubmitted}</td>
        </tr>)}</tbody>
      </table></div>
    </section>
    <div className="grid gap-5 xl:grid-cols-2">
      {canDelegate && <form className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5" onSubmit={(event) => {
        event.preventDefault(); const form = new FormData(event.currentTarget);
        void run(() => post("/api/office/president/delegations", {
          startsAt: new Date(String(form.get("startsAt"))).toISOString(),
          endsAt: new Date(String(form.get("endsAt"))).toISOString(),
        }));
      }}>
        <h2 className="font-bold text-navy-heading">Delegate to the Vice President</h2>
        <label className="block text-xs text-navy-body">Start <input required name="startsAt" type="datetime-local" className="mt-1 block w-full rounded-lg border border-navy-border bg-navy-bgStart p-3" /></label>
        <label className="block text-xs text-navy-body">End <input required name="endsAt" type="datetime-local" className="mt-1 block w-full rounded-lg border border-navy-border bg-navy-bgStart p-3" /></label>
        <button disabled={busy} className="min-h-touch rounded-xl bg-mint px-4 font-bold text-navy-bgStart">Record delegation</button>
        <ul className="space-y-1 text-xs text-navy-body">{delegations.map((item) => <li key={item.id}>{item.status}: {new Date(item.startsAt).toLocaleString()} – {new Date(item.endsAt).toLocaleString()}</li>)}</ul>
      </form>}
      <form className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5" onSubmit={(event) => {
        event.preventDefault(); const form = new FormData(event.currentTarget);
        void run(() => post("/api/office/motions", {
          meetingId: form.get("meetingId"), title: form.get("title"), description: form.get("description"),
          quorumPercent: Number(form.get("quorumPercent")),
        }));
      }}>
        <h2 className="font-bold text-navy-heading">Create a motion</h2>
        <select required name="meetingId" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm"><option value="">Select meeting</option>{meetings.map((meeting) => <option key={meeting.id} value={meeting.id}>{meeting.title} — {new Date(meeting.date).toLocaleDateString()}</option>)}</select>
        <input name="title" required minLength={3} placeholder="Motion title" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <textarea name="description" required placeholder="Motion and rationale" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <label className="text-xs text-navy-body">Quorum (%) <input name="quorumPercent" type="number" min="1" max="100" defaultValue="50" className="ml-2 w-20 rounded border border-navy-border bg-navy-bgStart p-2" /></label>
        <button disabled={busy || meetings.length === 0} className="block min-h-touch rounded-xl bg-mint px-4 font-bold text-navy-bgStart">Create motion</button>
      </form>
    </div>
    <section className="space-y-3">
      <h2 className="font-bold text-navy-heading">Motions and votes</h2>
      {motions.map((motion) => <article key={motion.id} className="rounded-2xl border border-navy-border bg-navy-card p-4">
        <div className="flex flex-wrap justify-between gap-2"><strong>{motion.title}</strong><span className="text-xs text-mint">{motion.status}{motion.result ? ` · ${motion.result}` : ""}</span></div>
        <p className="my-2 text-sm text-navy-body">{motion.description}</p>
        <p className="text-xs text-navy-subtle">{motion.votes.length} votes · quorum {motion.quorumPercent}%</p>
        <div className="mt-3 flex flex-wrap gap-2">{motion.status === "OPEN" && (["FOR", "AGAINST", "ABSTAIN"] as const).map((vote) => <button key={vote} onClick={() => void run(() => post(`/api/office/motions/${motion.id}/vote`, { vote }))} className={`min-h-touch rounded-lg border px-3 text-xs ${motion.votes.find((item) => item.office === office)?.vote === vote ? "border-mint text-mint" : "border-navy-border"}`}>Vote {vote.toLowerCase()}</button>)}
          {motion.status === "OPEN" && <button onClick={() => void run(() => post("/api/office/motions", { closeMotionId: motion.id }))} className="min-h-touch rounded-lg border border-navy-border px-3 text-xs">Close vote</button>}</div>
      </article>)}
      {!motions.length && <p className="text-sm text-navy-subtle">No motions created.</p>}
    </section>
  </div>;
}

export function VicePresidentWorkspace({ committees, board, meetings }: {
  committees: Committee[]; board: CoordinationOffice[]; meetings: MeetingOption[];
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>, action: (form: FormData) => Promise<unknown>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try { await action(new FormData(event.currentTarget)); setMessage("Saved."); window.location.reload(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Request failed"); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5">
    <Message>{message}</Message>
    <div className="grid gap-5 xl:grid-cols-2">
      <form onSubmit={(event) => void submit(event, (form) => post("/api/office/vice-president/committees", {
        name: form.get("name"), description: form.get("description"),
        members: form.getAll("members"),
      }))} className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5">
        <h2 className="font-bold text-navy-heading">Create committee</h2>
        <input required name="name" placeholder="Committee name" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <textarea name="description" placeholder="Purpose and outputs" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <fieldset className="grid grid-cols-2 gap-2 text-xs text-navy-body">{EXECUTIVES_LIST.map((executive) => <label key={executive.officeSlug} className="flex gap-2"><input type="checkbox" name="members" value={executive.officeSlug} />{executive.position}</label>)}</fieldset>
        <button disabled={busy} className="min-h-touch rounded-xl bg-mint px-4 font-bold text-navy-bgStart">Create committee</button>
        <div className="space-y-2">{committees.map((item) => <p key={item.id} className="text-sm text-navy-body"><strong>{item.name}</strong> · {item.members.map((member) => member.office).join(", ")}</p>)}</div>
      </form>
      <form onSubmit={(event) => void submit(event, (form) => post("/api/office/vice-president/meetings", {
        title: form.get("title"), date: new Date(String(form.get("date"))).toISOString(),
        venue: form.get("venue"), agenda: form.get("agenda"), mandatory: form.get("mandatory") === "on",
      }))} className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5">
        <h2 className="font-bold text-navy-heading">Request a meeting</h2>
        <p className="text-xs text-navy-subtle">The President must approve this request unless you are acting as President.</p>
        <input required name="title" placeholder="Meeting title" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <input required name="date" type="datetime-local" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <input required name="venue" placeholder="Venue or link" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <textarea required name="agenda" placeholder="Agenda" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <label className="flex gap-2 text-xs text-navy-body"><input name="mandatory" type="checkbox" /> Mandatory</label>
        <button disabled={busy} className="min-h-touch rounded-xl bg-mint px-4 font-bold text-navy-bgStart">Submit for approval</button>
        <p className="text-xs text-navy-subtle">{meetings.length} upcoming meetings already on the shared calendar.</p>
      </form>
    </div>
    <section className="rounded-2xl border border-navy-border bg-navy-card p-5">
      <h2 className="mb-3 font-bold text-navy-heading">Cross-office coordination</h2>
      <div className="grid gap-3 md:grid-cols-2">{board.map((item) => <article key={item.office} className="rounded-xl border border-navy-border p-3">
        <h3 className="font-semibold text-navy-heading">{item.position}</h3>
        <p className="mt-2 text-xs text-navy-body">{item.tasks.length} open task(s) · {item.meetings.length} upcoming event(s)</p>
        {item.tasks.slice(0, 3).map((task) => <p key={task.id} className="mt-1 text-xs text-navy-subtle">{task.title}{task.dueDate ? ` · due ${new Date(task.dueDate).toLocaleDateString()}` : ""}</p>)}
      </article>)}</div>
    </section>
  </div>;
}

export function MinutesStudio({ meetings }: { meetings: Array<{
  id: string; title: string; date: string; status: string | null; attendance: string[];
  agendaItems: Array<{ decision: string; why: string; ownerOffice: string; deadline: string; shareable: boolean }> | null;
}> }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(form: HTMLFormElement, submit: boolean) {
    setBusy(true); setMessage("");
    const values = new FormData(form);
    const ownerOffice = String(values.get("ownerOffice"));
    try {
      await post("/api/office/general-secretary/minutes", {
        meetingId: values.get("meetingId"), content: values.get("content"),
        attendance: values.getAll("attendance"),
        agendaItems: values.get("decision") ? [{
          decision: values.get("decision"), why: values.get("why"), ownerOffice,
          deadline: values.get("deadline") ? new Date(String(values.get("deadline"))).toISOString() : null,
          shareable: values.get("shareable") === "on",
        }] : [],
        submit,
      });
      setMessage(submit ? "Minutes submitted to the General Secretary for approval." : "Draft saved.");
      window.location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save minutes"); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4">
    <Message>{message}</Message>
    <form className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5" onSubmit={(event) => { event.preventDefault(); void save(event.currentTarget, false); }}>
      <h2 className="font-bold text-navy-heading">Draft or submit meeting minutes</h2>
      <select required name="meetingId" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm">
        <option value="">Select a meeting</option>{meetings.map((meeting) => <option key={meeting.id} value={meeting.id}>{meeting.title} — {new Date(meeting.date).toLocaleString()}{meeting.status ? ` · ${meeting.status}` : ""}</option>)}
      </select>
      <label className="block text-xs text-navy-body">Attendance</label>
      <div className="grid grid-cols-2 gap-2 text-xs text-navy-body">{EXECUTIVES_LIST.map((executive) => <label key={executive.officeSlug} className="flex gap-2"><input type="checkbox" name="attendance" value={executive.officeSlug} />{executive.position}</label>)}</div>
      <textarea name="content" rows={5} placeholder="Meeting notes and context" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <h3 className="font-semibold text-navy-heading">Action item / decision</h3>
      <input name="decision" placeholder="Decision or action item" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <textarea name="why" placeholder="Why / context" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <div className="grid gap-3 md:grid-cols-2">
        <select name="ownerOffice" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm">{EXECUTIVES_LIST.map((executive) => <option key={executive.officeSlug} value={executive.officeSlug}>{executive.position}</option>)}</select>
        <input name="deadline" type="date" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      </div>
      <label className="flex gap-2 text-xs text-navy-body"><input type="checkbox" name="shareable" defaultChecked /> Include this item in the public Decision Digest</label>
      <div className="flex flex-wrap gap-2"><button disabled={busy} className="min-h-touch rounded-xl border border-navy-border px-4 text-sm">Save draft</button>
        <button disabled={busy} type="button" onClick={(event) => {
          const form = event.currentTarget.form;
          if (form?.reportValidity()) void save(form, true);
        }} className="min-h-touch rounded-xl bg-mint px-4 text-sm font-bold text-navy-bgStart">Submit for General Secretary approval</button></div>
    </form>
    <section className="space-y-2">{meetings.filter((meeting) => meeting.status).map((meeting) => <article key={meeting.id} className="rounded-xl border border-navy-border bg-navy-card p-4">
      <h3 className="font-semibold text-navy-heading">{meeting.title}</h3><p className="text-xs text-navy-subtle">{meeting.status} · {meeting.agendaItems?.length ?? 0} agenda/action item(s)</p>
    </article>)}</section>
  </div>;
}

export function GeneralSecretaryDelegation({ delegations }: { delegations: Delegation[] }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await post("/api/office/general-secretary/delegations", {
        startsAt: new Date(String(form.get("startsAt"))).toISOString(),
        endsAt: new Date(String(form.get("endsAt"))).toISOString(),
      });
      window.location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create cover period"); }
    finally { setBusy(false); }
  }
  return <section className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5">
    <h2 className="font-bold text-navy-heading">AGS cover mode</h2>
    <p className="text-sm text-navy-body">Delegated GenSec capabilities are active only between the recorded start and end dates. Both transitions are logged.</p>
    {message && <p role="status" className="text-sm text-red-300">{message}</p>}
    <form onSubmit={(event) => void create(event)} className="grid gap-3 md:grid-cols-3">
      <input required name="startsAt" type="datetime-local" aria-label="Cover starts" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <input required name="endsAt" type="datetime-local" aria-label="Cover ends" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <button disabled={busy} className="min-h-touch rounded-xl bg-mint px-4 font-bold text-navy-bgStart">Delegate to AGS</button>
    </form>
    {delegations.map((item) => <p key={item.id} className="text-xs text-navy-subtle">{item.status} · {new Date(item.startsAt).toLocaleString()} – {new Date(item.endsAt).toLocaleString()}</p>)}
  </section>;
}
