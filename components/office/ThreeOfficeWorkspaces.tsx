"use client";

import { useState } from "react";
import { EXECUTIVES_LIST } from "@/config/executives";

type Draft = { id: string; title: string; body: string; category: string; pinned: boolean; status: string };
type ContentItem = { id: string; title: string; channel: string; scheduledAt: string; notes: string };
type Asset = { id: string; title: string; fileName: string; size: number };
type CoverageTask = { id: string; title: string; assignedToOffice: string; dueDate: string | null };
type AnnouncementItem = { id: string; title: string; category: string; pinned: boolean; viewCount: number };

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5">
    <h2 className="font-bold text-navy-heading">{title}</h2>{children}
  </section>;
}

async function sendJson(url: string, method: string, body: unknown) {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed");
  return result.data;
}

export function ProWorkspace({ data }: {
  data: {
    drafts: Draft[];
    published: AnnouncementItem[];
    calendar: ContentItem[];
    assets: Asset[];
    coverage: CoverageTask[];
  };
}) {
  const [drafts, setDrafts] = useState(data.drafts);
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState({ title: "", body: "", category: "General", pinned: false, official: true });
  const [copyState, setCopyState] = useState("");
  const [published, setPublished] = useState(data.published);
  const [calendar, setCalendar] = useState(data.calendar);
  const [assets, setAssets] = useState(data.assets);
  const [coverage, setCoverage] = useState(data.coverage);

  async function saveDraft(formElement: HTMLFormElement, submit: boolean) {
    const form = new FormData(formElement);
    const input = {
      title: String(form.get("title") ?? ""), body: String(form.get("body") ?? ""),
      category: String(form.get("category") ?? "General"), pinned: form.get("pinned") === "on",
      official: true, submit,
    };
    setPreview(input);
    try {
      const draft = await sendJson("/api/office/pro/announcements", "POST", input) as Draft;
      setDrafts((items) => [draft, ...items]);
      setNotice(submit ? "Submitted for General Secretary or President approval." : "Draft saved.");
      if (submit) formElement.reset();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save draft."); }
  }

  async function createContent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const item = await sendJson("/api/office/pro/calendar", "POST", {
        title: form.get("title"), channel: form.get("channel"),
        scheduledAt: new Date(String(form.get("scheduledAt"))).toISOString(), notes: form.get("notes"),
      }) as ContentItem;
      setCalendar((items) => [...items, item]);
      setNotice("Content added to the calendar.");
      formElement.reset();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not add content."); }
  }

  async function uploadAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/office/pro/assets", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      setAssets((items) => [result.data, ...items]);
      setNotice("Asset uploaded.");
      formElement.reset();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not upload asset."); }
  }

  async function assignCoverage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const task = await sendJson("/api/office/pro/coverage", "POST", {
        title: form.get("title"), assignedToOffice: form.get("office"),
        dueDate: form.get("dueDate") ? new Date(String(form.get("dueDate"))).toISOString() : null,
      }) as CoverageTask;
      setCoverage((items) => [task, ...items]);
      setNotice("Coverage assignment added to the office task board.");
      formElement.reset();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not assign coverage."); }
  }

  async function copyShareKit(channel: "WhatsApp" | "Instagram" | "X") {
    const link = `${window.location.origin}/announcements`;
    const text = channel === "WhatsApp"
      ? `*NACOS UNILAG ${preview.category.toUpperCase()} ANNOUNCEMENT*\n\n*${preview.title}*\n\n${preview.body}\n\n${link}`
      : channel === "Instagram"
        ? `NACOS UNILAG: ${preview.title}\n\n${preview.body.slice(0, 180)}${preview.body.length > 180 ? "..." : ""}\n\nMore: ${link}\n#NACOSUNILAG`
        : `${preview.title} — ${preview.body.slice(0, 200)}${preview.body.length > 200 ? "…" : ""} ${link} #NACOSUNILAG`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(`${channel} version copied`);
    } catch { setCopyState("Clipboard unavailable in this browser."); }
  }

  return <div className="space-y-5">
    {notice && <p role="status" className="text-sm text-mint">{notice}</p>}
    <div className="grid gap-5 xl:grid-cols-2">
      <Box title="Announcement studio">
        <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); void saveDraft(event.currentTarget, false); }}>
          <input name="title" required minLength={3} maxLength={200} placeholder="Announcement title" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" onChange={(event) => setPreview((item) => ({ ...item, title: event.target.value }))} />
          <select name="category" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" onChange={(event) => setPreview((item) => ({ ...item, category: event.target.value }))}>
            {["General", "Academic", "Event", "Urgent", "Deadline"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <textarea name="body" required minLength={10} maxLength={10000} rows={6} placeholder="Announcement copy" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" onChange={(event) => setPreview((item) => ({ ...item, body: event.target.value }))} />
          <label className="flex items-center gap-2 text-sm text-navy-body"><input type="checkbox" name="pinned" onChange={(event) => setPreview((item) => ({ ...item, pinned: event.target.checked }))} /> Pin on student feed</label>
          <p className="text-xs text-navy-subtle">Student-feed announcements are official notices. Publishing requests require General Secretary or President approval; urgent posts are flagged automatically.</p>
          <div className="flex flex-wrap gap-2">
            <button className="min-h-touch rounded-xl border border-navy-border px-4 text-sm font-bold text-navy-heading">Save draft</button>
            <button type="button" onClick={(event) => { const form = event.currentTarget.form; if (form?.reportValidity()) void saveDraft(form, true); }} className="min-h-touch rounded-xl bg-mint px-4 text-sm font-bold text-navy-onAccent">Submit for approval</button>
          </div>
        </form>
      </Box>
      <Box title="Live preview & share kit">
        <article className="rounded-xl border border-navy-border p-4">
          <div className="flex gap-2 text-[10px] font-bold uppercase text-mint">{preview.category}{preview.pinned ? " · PINNED" : ""}{preview.official ? " · OFFICIAL" : ""}</div>
          <h3 className="mt-2 font-bold text-navy-heading">{preview.title || "Announcement title preview"}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-navy-body">{preview.body || "Your announcement preview will appear here."}</p>
        </article>
        <p className="text-xs text-navy-subtle">WhatsApp auto-posting is not available. Copy the text and post it manually.</p>
        <div className="flex flex-wrap gap-2">{(["WhatsApp", "Instagram", "X"] as const).map((channel) =>
          <button key={channel} onClick={() => void copyShareKit(channel)} className="min-h-touch rounded-lg border border-navy-border px-3 text-xs font-semibold text-navy-body">Copy {channel} version</button>
        )}</div>
        {copyState && <p role="status" className="text-xs text-mint">{copyState}</p>}
        <div className="space-y-1 text-xs text-navy-body">
          <p className="font-bold">NACOS WhatsApp groups — manually check before sending:</p>
          {["NACOS general announcements", "Each level/year group", "NACOS executives", "Event-specific group"].map((group) =>
            <label key={group} className="flex gap-2"><input type="checkbox" /> {group}</label>
          )}
        </div>
      </Box>
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <Box title="Content calendar">
        <form className="grid gap-2" onSubmit={(event) => void createContent(event)}>
          <input name="title" required minLength={3} placeholder="Post or coverage title" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <div className="grid gap-2 sm:grid-cols-2">
            <select name="channel" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm">{["WhatsApp", "Instagram", "X", "Website", "Other"].map((item) => <option key={item}>{item}</option>)}</select>
            <input required name="scheduledAt" type="datetime-local" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          </div>
          <input name="notes" placeholder="Notes" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <button className="min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-onAccent">Schedule content</button>
        </form>
        <ul className="space-y-2 text-xs text-navy-body">{calendar.map((item) => <li key={item.id}>{new Date(item.scheduledAt).toLocaleString()} · {item.channel} · {item.title}</li>)}</ul>
      </Box>
      <Box title="Flyer and asset library">
        <form className="grid gap-2" onSubmit={(event) => void uploadAsset(event)}>
          <input name="title" required minLength={2} placeholder="Asset title" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <input name="description" placeholder="Description" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <input name="file" required type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" className="text-xs text-navy-body" />
          <p className="text-[11px] text-navy-subtle">Images and PDF only, max 10 MB. Prototype files are stored locally.</p>
          <button className="min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-onAccent">Upload asset</button>
        </form>
        <ul className="space-y-2 text-xs text-navy-body">{assets.map((asset) =>
          <li key={asset.id} className="flex justify-between gap-3"><span>{asset.title} · {asset.fileName} ({Math.ceil(asset.size / 1024)} KB)</span><a className="text-mint underline" href={`/api/office/pro/assets/${asset.id}`}>Download</a></li>
        )}</ul>
      </Box>
    </div>
    <Box title="Event coverage assignments">
      <form className="grid gap-2 md:grid-cols-3" onSubmit={(event) => void assignCoverage(event)}>
        <input name="title" required minLength={3} placeholder="Event / coverage assignment" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <select name="office" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm">{EXECUTIVES_LIST.map((item) => <option key={item.officeSlug} value={item.officeSlug}>{item.position}</option>)}</select>
        <input name="dueDate" type="datetime-local" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <button className="min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-onAccent md:col-span-3">Assign coverage task</button>
      </form>
      <ul className="space-y-1 text-xs text-navy-body">{coverage.map((task) => <li key={task.id}>{task.title} · {task.assignedToOffice}{task.dueDate ? ` · due ${new Date(task.dueDate).toLocaleString()}` : ""}</li>)}</ul>
    </Box>
    <Box title="Recent announcements and basic view counts">
      <ul className="space-y-2 text-sm text-navy-body">{published.map((item) =>
        <li key={item.id}>{item.title} · {item.category}{item.pinned ? " · pinned" : ""} · {item.viewCount} detail views</li>
      )}</ul>
      {!published.length && <p className="text-xs text-navy-subtle">Approved announcements will appear here.</p>}
      <ul className="space-y-1 text-xs text-navy-subtle">{drafts.map((draft) => <li key={draft.id}>{draft.title} · {draft.status}</li>)}</ul>
    </Box>
  </div>;
}

type PlatformRequest = { id: string; kind: string; title: string; description: string; status: string; requesterOffice: string | null };
type Developer = { id: string; name: string; skills: string; availability: string; assignedTask: string | null };
type Release = { id: string; version: string; title: string; notes: string; published: boolean };

export function SoftwareWorkspace({ data }: { data: { requests: PlatformRequest[]; developers: Developer[]; releases: Release[] } }) {
  const [requests, setRequests] = useState(data.requests);
  const [developers, setDevelopers] = useState(data.developers);
  const [releases, setReleases] = useState(data.releases);
  const [notice, setNotice] = useState("");

  async function changeStatus(id: string, status: string) {
    try {
      await sendJson("/api/office/software/board", "PATCH", { id, status });
      setRequests((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not update request."); }
  }
  async function addDeveloper(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      const item = await sendJson("/api/office/software/developers", "POST", {
        name: form.get("name"), skills: form.get("skills"), availability: form.get("availability"), assignedTask: form.get("assignedTask") || null,
      }) as Developer;
      setDevelopers((items) => [item, ...items]); formElement.reset(); setNotice("Volunteer added.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not add volunteer."); }
  }
  async function addRelease(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      const item = await sendJson("/api/office/software/releases", "POST", {
        version: form.get("version"), title: form.get("title"), notes: form.get("notes"), published: form.get("published") === "on",
      }) as Release;
      setReleases((items) => [item, ...items]); formElement.reset(); setNotice("Release note saved.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save release."); }
  }
  async function submitTechnicalChange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      await sendJson("/api/office/software/technical-changes", "POST", { title: form.get("title"), description: form.get("description") });
      formElement.reset(); setNotice("Technical account/role change is waiting for President AND General Secretary approval.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not submit the change."); }
  }

  return <div className="space-y-5">
    {notice && <p role="status" className="text-sm text-mint">{notice}</p>}
    <div className="grid gap-3 sm:grid-cols-2">
      <a href="/office/software/status" className="rounded-xl border border-navy-border bg-navy-card p-4 text-sm font-bold text-mint">System status →</a>
      <a href="/office/software/security" className="rounded-xl border border-navy-border bg-navy-card p-4 text-sm font-bold text-mint">Security checklist →</a>
      <a href="/office/tasks" className="rounded-xl border border-navy-border bg-navy-card p-4 text-sm font-bold text-mint sm:col-span-2">Shared task board →</a>
    </div>
    <Box title="Student and executive platform board">
      {requests.map((request) => <article key={request.id} className="space-y-2 border-t border-navy-border pt-3">
        <div className="flex flex-wrap justify-between gap-2"><strong className="text-sm text-navy-heading">{request.kind}: {request.title}</strong><span className="text-xs text-navy-subtle">{request.requesterOffice ? `Executive · ${request.requesterOffice}` : "Student"} · {request.status}</span></div>
        <p className="text-xs text-navy-body">{request.description}</p>
        {request.kind !== "TECHNICAL_CHANGE" && <select value={request.status} onChange={(event) => void changeStatus(request.id, event.target.value)} className="rounded-lg border border-navy-border bg-navy-bgStart p-2 text-xs">
          {["OPEN", "IN_PROGRESS", "DONE", "DECLINED"].map((status) => <option key={status}>{status}</option>)}
        </select>}
      </article>)}
      {!requests.length && <p className="text-xs text-navy-subtle">No platform requests have been submitted.</p>}
    </Box>
    <div className="grid gap-5 xl:grid-cols-2">
      <Box title="Volunteer developer roster">
        <form className="grid gap-2" onSubmit={(event) => void addDeveloper(event)}>
          <input name="name" required placeholder="Volunteer name (demo only)" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <input name="skills" required placeholder="Skills" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <input name="availability" required placeholder="Availability" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <input name="assignedTask" placeholder="Assigned task (optional)" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <button className="min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-onAccent">Add volunteer</button>
        </form>
        <ul className="space-y-2 text-xs text-navy-body">{developers.map((dev) => <li key={dev.id}><strong>{dev.name}</strong> · {dev.skills} · {dev.availability}{dev.assignedTask ? ` · ${dev.assignedTask}` : ""}</li>)}</ul>
      </Box>
      <Box title="Release notes">
        <form className="grid gap-2" onSubmit={(event) => void addRelease(event)}>
          <input name="version" required placeholder="Version, e.g. 0.2.0" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <input name="title" required placeholder="Release title" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <textarea name="notes" required minLength={5} placeholder="Changes and fixes" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <label className="flex gap-2 text-xs text-navy-body"><input type="checkbox" name="published" /> Publish notes</label>
          <button className="min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-onAccent">Save release notes</button>
        </form>
        <ul className="space-y-2 text-xs text-navy-body">{releases.map((note) => <li key={note.id}><strong>{note.version} · {note.title}</strong> {note.published ? "· Published" : "· Draft"} — {note.notes}</li>)}</ul>
      </Box>
    </div>
    <Box title="Two-key technical account and role changes">
      <p className="text-xs text-navy-subtle">Both the President and General Secretary must approve. Approval records the change request; it does not provision real accounts in this demo.</p>
      <form className="grid gap-2" onSubmit={(event) => void submitTechnicalChange(event)}>
        <input name="title" required minLength={4} placeholder="Change title" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <textarea name="description" required minLength={10} placeholder="Reason and requested role/account change" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <button className="min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-onAccent">Request two-key approval</button>
      </form>
    </Box>
  </div>;
}

type SocialVolunteer = { id: string; studentName: string; task: string; hours: number; hoursOptIn: boolean };
type SocialEvent = {
  id: string; title: string; description: string; venue: string; startsAt: string; endsAt: string;
  budgetRequest: number; checklist: string; status: string; report: string | null;
  volunteers: SocialVolunteer[]; feedback?: Array<{ id: string; rating: number; feedback: string; createdAt: string }>;
  _count?: { rsvps: number; feedback: number };
};

export function SocialWorkspace({ initialEvents }: { initialEvents: SocialEvent[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [notice, setNotice] = useState("");
  async function createEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      const result = await sendJson("/api/office/social/events", "POST", {
        title: form.get("title"), description: form.get("description"), venue: form.get("venue"),
        startsAt: new Date(String(form.get("startsAt"))).toISOString(), endsAt: new Date(String(form.get("endsAt"))).toISOString(),
        budgetRequest: Number(form.get("budgetRequest")),
        checklist: String(form.get("checklist") || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
      }) as SocialEvent;
      setEvents((items) => [result, ...items]); formElement.reset();
      setNotice("Event and budget request sent to the Treasurer for approval.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not create event."); }
  }
  async function saveHours(volunteer: SocialVolunteer, value: string) {
    try {
      await sendJson("/api/office/social/events", "PATCH", { action: "HOURS", volunteerId: volunteer.id, hours: Number(value) });
      setEvents((items) => items.map((item) => ({
        ...item, volunteers: item.volunteers.map((row) => row.id === volunteer.id ? { ...row, hours: Number(value) } : row),
      })));
      setNotice("Opt-in volunteer hours recorded.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not record hours."); }
  }
  async function assignEventTask(event: React.FormEvent<HTMLFormElement>, eventId: string) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await sendJson("/api/office/social/events", "PATCH", {
        action: "TASK", eventId, title: form.get("title"),
        assignedToOffice: form.get("assignedToOffice"),
        dueDate: form.get("dueDate") ? new Date(String(form.get("dueDate"))).toISOString() : null,
      });
      formElement.reset();
      setNotice("Event task assigned and added to the shared task board.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not assign event task."); }
  }
  async function saveReport(event: React.FormEvent<HTMLFormElement>, eventId: string) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      const result = await sendJson("/api/office/social/events", "PATCH", { action: "REPORT", eventId, report: form.get("report") }) as SocialEvent;
      setEvents((items) => items.map((item) => item.id === result.id ? { ...item, report: result.report } : item));
      setNotice("Event report saved.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save report."); }
  }
  return <div className="space-y-5">
    {notice && <p role="status" className="text-sm text-mint">{notice}</p>}
    <section className="rounded-2xl border border-navy-border bg-navy-card p-5">
      <h2 className="mb-3 font-bold text-navy-heading">Plan event and request budget</h2>
      <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void createEvent(event)}>
        <input name="title" required minLength={3} placeholder="Event title" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <input name="venue" required placeholder="Venue" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <input name="startsAt" required type="datetime-local" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <input name="endsAt" required type="datetime-local" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <input name="budgetRequest" required type="number" min="0" step="0.01" placeholder="Budget request (NGN)" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <textarea name="description" required minLength={10} placeholder="Event description" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm md:col-span-2" />
        <textarea name="checklist" placeholder={"Checklist (one item per line)\nVenue\nPromotion"} className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm md:col-span-2" />
        <button className="min-h-touch rounded-xl bg-mint px-4 font-bold text-navy-onAccent md:col-span-2">Submit for Treasurer approval</button>
      </form>
    </section>
    {events.map((item) => <article key={item.id} className="space-y-4 rounded-2xl border border-navy-border bg-navy-card p-5">
      <header className="flex flex-wrap justify-between gap-2">
        <div><h2 className="font-bold text-navy-heading">{item.title}</h2><p className="text-xs text-navy-body">{new Date(item.startsAt).toLocaleString()} · {item.venue} · budget ₦{item.budgetRequest.toLocaleString()}</p></div>
        <span className="text-xs font-bold text-mint">{item.status.replaceAll("_", " ")}</span>
      </header>
      <p className="text-sm text-navy-body">{item.description}</p>
      {item.status === "APPROVED" && <p className="text-xs text-mint">Published on the student calendar · {item._count?.rsvps ?? 0} RSVPs</p>}
      <div className="space-y-1 text-xs text-navy-body">
        <h3 className="font-bold text-navy-subtle">Event checklist</h3>
        {(JSON.parse(item.checklist || "[]") as string[]).map((entry) => {
          const complete = entry.startsWith("✓ ");
          const label = entry.replace(/^[✓□]\s*/, "");
          return <label key={label} className="flex gap-2">
            <input type="checkbox" checked={complete} onChange={(event) => {
              const checklist = (JSON.parse(item.checklist || "[]") as string[]).map((value) => {
                const text = value.replace(/^[✓□]\s*/, "");
                if (text !== label) return value;
                return event.target.checked ? `✓ ${text}` : text;
              });
              void sendJson("/api/office/social/events", "PATCH", { action: "CHECKLIST", eventId: item.id, checklist })
                .then(() => setEvents((items) => items.map((current) => current.id === item.id ? { ...current, checklist: JSON.stringify(checklist) } : current)))
                .catch((error) => setNotice(error instanceof Error ? error.message : "Could not update checklist."));
            }} />{label}
          </label>;
        })}
        {!JSON.parse(item.checklist || "[]").length && <p className="text-navy-subtle">No checklist items.</p>}
      </div>
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase text-navy-subtle">Volunteer roster · record hours only when opted in</h3>
        {item.volunteers.map((volunteer) => <div key={volunteer.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-navy-border pt-2 text-xs text-navy-body">
          <span>{volunteer.studentName} · {volunteer.task}{volunteer.hoursOptIn ? " · opted in" : " · hours not opted in"}</span>
          {volunteer.hoursOptIn && <label className="flex items-center gap-2">Hours <input key={`${volunteer.id}-${volunteer.hours}`} type="number" min="0" max="200" step="0.5" defaultValue={volunteer.hours} onBlur={(event) => void saveHours(volunteer, event.currentTarget.value)} className="w-20 rounded border border-navy-border bg-navy-bgStart p-2" /></label>}
        </div>)}
        {!item.volunteers.length && <p className="text-xs text-navy-subtle">No volunteer signups yet.</p>}
      </div>
      {item.status === "APPROVED" && <form className="grid gap-2 border-t border-navy-border pt-3 md:grid-cols-3" onSubmit={(event) => void assignEventTask(event, item.id)}>
        <input name="title" required minLength={3} placeholder="Event task" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <select name="assignedToOffice" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm">{EXECUTIVES_LIST.map((office) => <option key={office.officeSlug} value={office.officeSlug}>{office.position}</option>)}</select>
        <input name="dueDate" type="datetime-local" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <button className="min-h-touch rounded-lg border border-navy-border px-4 text-xs font-bold text-navy-body md:col-span-3">Assign to shared task board</button>
      </form>}
      {item.status === "APPROVED" && new Date(item.endsAt) < new Date() && <form className="grid gap-2 border-t border-navy-border pt-3" onSubmit={(event) => void saveReport(event, item.id)}>
        <label className="text-xs font-bold text-navy-heading">Post-event report</label>
        <textarea name="report" required minLength={5} defaultValue={item.report ?? ""} placeholder="Outcomes, attendance, and follow-up" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <button className="min-h-touch rounded-lg bg-mint px-4 text-xs font-bold text-navy-onAccent">Save event report</button>
      </form>}
      {item.feedback?.length ? <div className="space-y-2 border-t border-navy-border pt-3">
        <h3 className="text-xs font-bold uppercase text-navy-subtle">Post-event feedback · {item.feedback.length}</h3>
        {item.feedback.map((feedback) => <p key={feedback.id} className="text-xs text-navy-body">{feedback.rating}/5 · {feedback.feedback}</p>)}
      </div> : null}
    </article>)}
    {!events.length && <p className="text-sm text-navy-subtle">No events yet.</p>}
  </div>;
}

export function StudentPlatformRequestForm() {
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      const result = await sendJson("/api/platform-requests", "POST", {
        kind: form.get("kind"), title: form.get("title"), description: form.get("description"),
      });
      setMessage(`Request submitted. Reference: ${result.id}`);
      formElement.reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not send request."); }
  }
  return <form className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5" onSubmit={(event) => void submit(event)}>
    <h2 className="font-bold text-navy-heading">Report a platform bug or request a feature</h2>
    <p className="text-xs text-navy-subtle">Use fictional/demo details only; do not include real student data or passwords.</p>
    <select name="kind" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm"><option value="BUG">Bug report</option><option value="FEATURE">Feature request</option></select>
    <input name="title" required minLength={4} maxLength={160} placeholder="Short title" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
    <textarea name="description" required minLength={10} maxLength={5000} placeholder="What happened or what would help?" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
    <button className="min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-onAccent">Submit request</button>
    {message && <p role="status" className="text-xs text-mint">{message}</p>}
  </form>;
}

type PublicEvent = { id: string; title: string; description: string; venue: string; startsAt: string; endsAt: string; _count: { volunteers: number; rsvps: number } };
export function PublicEventsWorkspace({ initialEvents }: { initialEvents: PublicEvent[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [notice, setNotice] = useState("");
  async function postEvent(eventId: string, action: "volunteer" | "rsvp" | "feedback", body: Record<string, unknown>) {
    try {
      await sendJson(`/api/social-events/${eventId}/${action}`, "POST", body);
      setNotice(action === "volunteer" ? "Volunteer signup saved. Hours are recorded only if you opted in." : action === "rsvp" ? "RSVP saved." : "Feedback submitted.");
      const response = await fetch("/api/social-events"); const result = await response.json();
      if (response.ok) setEvents(result.data);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not submit."); }
  }
  return <div className="space-y-5">
    {notice && <p role="status" className="text-sm text-mint">{notice}</p>}
    <p className="text-xs text-navy-subtle">Prototype only: use a fictional/demo name, never real personal data.</p>
    {events.map((event) => <article key={event.id} className="space-y-4 rounded-2xl border border-navy-border bg-navy-card p-5">
      <header><h2 className="font-bold text-navy-heading">{event.title}</h2><p className="text-xs text-navy-body">{new Date(event.startsAt).toLocaleString()} · {event.venue} · {event._count.rsvps} RSVPs · {event._count.volunteers} volunteers</p></header>
      <p className="text-sm text-navy-body">{event.description}</p>
      <form className="grid gap-2 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); void postEvent(event.id, "volunteer", { studentName: f.get("studentName"), task: f.get("task"), hoursOptIn: f.get("hoursOptIn") === "on" }); e.currentTarget.reset(); }}>
        <input name="studentName" required minLength={2} placeholder="Name (demo only)" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <input name="task" required placeholder="How would you like to help?" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <label className="flex gap-2 text-xs text-navy-body sm:col-span-2"><input type="checkbox" name="hoursOptIn" /> I opt in to having my volunteer hours recorded.</label>
        <button className="min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-onAccent sm:col-span-2">Volunteer</button>
      </form>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => void postEvent(event.id, "rsvp", { response: "ATTENDING" })} className="min-h-touch rounded-lg border border-navy-border px-3 text-xs text-navy-body">RSVP: attending</button>
        <button onClick={() => void postEvent(event.id, "rsvp", { response: "APOLOGIES" })} className="min-h-touch rounded-lg border border-navy-border px-3 text-xs text-navy-body">Send apologies</button>
      </div>
      {new Date(event.endsAt) < new Date() && <form className="grid gap-2 sm:grid-cols-[auto_1fr_auto]" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); void postEvent(event.id, "feedback", { rating: Number(f.get("rating")), feedback: f.get("feedback") }); e.currentTarget.reset(); }}>
        <select name="rating" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}/5</option>)}</select>
        <input name="feedback" required minLength={3} placeholder="Post-event feedback" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
        <button className="min-h-touch rounded-lg border border-navy-border px-3 text-xs text-navy-body">Send feedback</button>
      </form>}
    </article>)}
    {!events.length && <p className="text-sm text-navy-subtle">No upcoming approved events.</p>}
  </div>;
}
