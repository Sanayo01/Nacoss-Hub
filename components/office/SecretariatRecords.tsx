"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { EXECUTIVES_LIST } from "@/config/executives";

type OfficeDocument = {
  id: string; title: string; description: string; folder: string; session: string;
  permission: string; tags: string; filePath: string | null; driveLink: string | null;
  versions: Array<{ id: string; version: number; createdAt: string | Date; filePath: string | null; driveLink: string | null; createdBy: string }>;
};
type Letter = { id: string; reference: string; recipient: string; subject: string; body: string; status: string; createdBy: string; createdAt: string | Date };
type Query = { id: string; targetOffice: string; createdBy: string; kind: string; subject: string; message: string; response: string | null; responseAt: string | Date | null; status: string; createdAt: string | Date };
type SecretariatConcern = { id: string; category: string; subject: string; message: string; isAnonymous: boolean; targetOfficeSlug: string; status: string; createdAt: string | Date; updatedAt: string | Date };
type PromiseRow = { id: string; title: string; description: string; baseline: string | null; target: string | null; delivered: string | null; isPublished: boolean };
type SiwesEntry = { id: string; studentName: string; level: string; company: string; role: string; isApproved: boolean; consentGiven: boolean };
type AlumnusEntry = { id: string; name: string; graduationYear: string; currentCompany: string; currentRole: string; isApproved: boolean; consentGiven: boolean };
type RemovalEntry = { id: string; targetType: string; targetId: string; reason: string; isResolved: boolean };
type DirectoryEntry = { officeSlug: string; name: string; position: string; officeEmail: string; photoUrl: string | null; isListed: boolean; emailConsent: boolean };

async function request(url: string, method: string, body?: unknown, multipart = false) {
  const response = await fetch(url, {
    method,
    ...(multipart ? { body: body as FormData } : body ? {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed");
  return result.data;
}

function StatusMessage({ text }: { text: string }) {
  return text ? <p role="status" className="rounded-lg border border-navy-border p-3 text-sm text-navy-body">{text}</p> : null;
}

export function OfficeDocumentVault({ initialDocuments, canFile }: { initialDocuments: OfficeDocument[]; canFile: boolean }) {
  const [documents] = useState(initialDocuments);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const shown = useMemo(() => documents.filter((item) =>
    `${item.title} ${item.description} ${item.folder} ${item.session} ${item.tags}`.toLowerCase().includes(query.toLowerCase())
  ), [documents, query]);
  async function upload(event: React.FormEvent<HTMLFormElement>, url: string) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      await request(url, "POST", new FormData(event.currentTarget), true);
      window.location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save document"); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4">
    <StatusMessage text={message} />
    {canFile && <form onSubmit={(event) => void upload(event, "/api/office/secretariat/documents")} className="grid gap-3 rounded-2xl border border-navy-border bg-navy-card p-5 md:grid-cols-2">
      <h2 className="font-bold text-navy-heading md:col-span-2">File a document</h2>
      <input name="title" required minLength={2} maxLength={200} placeholder="Document title" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <input name="folder" required placeholder="Folder / office" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <input name="session" required placeholder="Session (e.g. 2025/2026)" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <select name="permission" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm"><option value="EXECUTIVES">Executive-only</option><option value="PUBLIC">Public</option><option value="MEMBERS">Members</option><option value="OFFICE_ONLY">Office-only</option><option value="GENSEC_ONLY">General Secretary-only</option></select>
      <input name="tags" placeholder="Tags, comma separated" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <input name="driveLink" type="url" placeholder="Existing Drive link (HTTPS)" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <input name="file" type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" className="rounded-lg border border-navy-border bg-navy-bgStart p-2 text-xs" />
      <textarea name="description" placeholder="Description" rows={2} className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm md:col-span-2" />
      <button disabled={busy} className="min-h-touch rounded-xl bg-mint px-4 font-bold text-navy-bgStart md:col-span-2">{busy ? "Saving…" : "File document"}</button>
    </form>}
    <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search document vault" placeholder="Search titles, descriptions, folders, sessions, and tags" className="w-full rounded-lg border border-navy-border bg-navy-card p-3 text-sm" />
    <div className="grid gap-3 md:grid-cols-2">{shown.map((item) => <article key={item.id} className="rounded-2xl border border-navy-border bg-navy-card p-4">
      <div className="flex justify-between gap-2"><h2 className="font-bold text-navy-heading">{item.title}</h2><span className="text-[10px] text-mint">{item.permission}</span></div>
      <p className="mt-1 text-xs text-navy-subtle">{item.folder} · {item.session} · {item.versions.length} version(s)</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-navy-body">{item.description}</p>
      <p className="mt-2 text-xs text-navy-subtle">{JSON.parse(item.tags || "[]").join(" · ")}</p>
      <div className="mt-3 flex gap-3 text-xs">{item.filePath && <a className="text-mint underline" href={`/api/office/secretariat/documents/${item.id}/download`}>Download latest</a>}{item.driveLink && <a className="text-mint underline" href={item.driveLink} target="_blank" rel="noreferrer">Open Drive link</a>}</div>
      <details className="mt-3 text-xs text-navy-body"><summary className="cursor-pointer">Version history</summary>
        <ul className="mt-2 space-y-1">{item.versions.map((version) => <li key={version.id}>v{version.version} · {new Date(version.createdAt).toLocaleString()} · {version.createdBy}
          {version.filePath && <> · <a className="text-mint underline" href={`/api/office/secretariat/documents/${item.id}/download?version=${version.version}`}>download</a></>}
          {version.driveLink && <> · <a className="text-mint underline" href={version.driveLink} target="_blank" rel="noreferrer">Drive</a></>}</li>)}</ul>
      </details>
      {canFile && <form onSubmit={(event) => void upload(event, `/api/office/secretariat/documents/${item.id}/versions`)} className="mt-3 grid gap-2 sm:grid-cols-2">
        <input name="file" type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" className="rounded-lg border border-navy-border bg-navy-bgStart p-2 text-[10px]" />
        <input name="driveLink" type="url" placeholder="Replacement HTTPS Drive link" className="rounded-lg border border-navy-border bg-navy-bgStart p-2 text-xs" />
        <button disabled={busy} className="min-h-touch rounded-lg border border-navy-border px-3 text-xs sm:col-span-2">Add version</button>
      </form>}
    </article>)}</div>
    {!shown.length && <p className="text-sm text-navy-subtle">No matching documents.</p>}
  </div>;
}

export function OfficialLettersWorkspace({ initialLetters, office }: { initialLetters: Letter[]; office: string }) {
  const [letters, setLetters] = useState(initialLetters);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const element = event.currentTarget;
    try {
      const letter = await request("/api/office/secretariat/letters", "POST", {
        recipient: form.get("recipient"), subject: form.get("subject"), body: form.get("body"),
      }) as Letter;
      setLetters((current) => [letter, ...current]);
      element.reset();
      setMessage("Draft created. It remains internal until General Secretary approval.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create letter"); }
    finally { setBusy(false); }
  }
  async function submit(id: string) {
    setBusy(true); setMessage("");
    try { await request("/api/office/secretariat/letters", "PATCH", { id, action: "submit" }); window.location.reload(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit letter"); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4">
    <StatusMessage text={message} />
    <form onSubmit={(event) => void create(event)} className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5">
      <h2 className="font-bold text-navy-heading">Draft official letter</h2>
      <input name="recipient" required placeholder="Recipient / organization" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <input name="subject" required placeholder="Subject" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <textarea name="body" required minLength={10} rows={8} placeholder="Letter body" className="w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <button disabled={busy} className="min-h-touch rounded-xl bg-mint px-4 font-bold text-navy-bgStart">Save draft</button>
    </form>
    <div className="space-y-3">{letters.map((letter) => <article key={letter.id} className="rounded-2xl border border-navy-border bg-navy-card p-5">
      <div className="flex flex-wrap justify-between gap-2"><strong className="text-navy-heading">{letter.reference}</strong><span className="text-xs text-mint">{letter.status}</span></div>
      <p className="mt-1 text-sm text-navy-body">To: {letter.recipient} · {letter.subject}</p>
      <div className="mt-4 bg-white text-slate-900 print:border-0"><Image src="/nacos-letterhead-placeholder.svg" width={1200} height={220} alt="NACOS UNILAG letterhead placeholder" className="h-auto w-full" /><div className="min-h-48 whitespace-pre-wrap p-6 text-sm">{letter.body}</div></div>
      <div className="mt-3 flex gap-3 text-xs"><button onClick={() => window.print()} className="text-mint underline">Print / save as PDF</button>
        {letter.status === "DRAFT" && office !== "general-secretary" && <button disabled={busy} onClick={() => void submit(letter.id)} className="text-mint underline">Submit for GenSec approval</button>}</div>
    </article>)}</div>
    {!letters.length && <p className="text-sm text-navy-subtle">No letters recorded.</p>}
  </div>;
}

export function OversightWorkspace({ initialQueries, office, canCreate }: { initialQueries: Query[]; office: string; canCreate: boolean }) {
  const [queries, setQueries] = useState(initialQueries);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const element = event.currentTarget;
    try {
      const item = await request("/api/office/oversight", "POST", {
        targetOffice: form.get("targetOffice"), kind: form.get("kind"),
        subject: form.get("subject"), message: form.get("message"),
      }) as Query;
      setQueries((current) => [item, ...current]); element.reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not send"); }
    finally { setBusy(false); }
  }
  async function respond(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const item = await request("/api/office/oversight", "PATCH", { id, response: form.get("response") }) as Query;
      setQueries((current) => current.map((query) => query.id === item.id ? item : query));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not respond"); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4">
    <StatusMessage text={message} />
    {canCreate && <form onSubmit={(event) => void create(event)} className="grid gap-3 rounded-2xl border border-navy-border bg-navy-card p-5 md:grid-cols-2">
      <h2 className="font-bold text-navy-heading md:col-span-2">Send formal query or reminder</h2>
      <select name="targetOffice" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm">{EXECUTIVES_LIST.map((item) => <option key={item.officeSlug} value={item.officeSlug}>{item.position}</option>)}</select>
      <select name="kind" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm"><option value="QUERY">Formal query</option><option value="REMINDER">Reminder</option></select>
      <input name="subject" required placeholder="Subject" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm md:col-span-2" />
      <textarea name="message" required placeholder="Message and requested response" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm md:col-span-2" />
      <button disabled={busy} className="min-h-touch rounded-xl bg-mint px-4 font-bold text-navy-bgStart md:col-span-2">Record and send</button>
    </form>}
    <div className="space-y-3">{queries.map((item) => <article key={item.id} className="rounded-2xl border border-navy-border bg-navy-card p-5">
      <div className="flex justify-between gap-2"><strong className="text-navy-heading">{item.subject}</strong><span className="text-xs text-mint">{item.status}</span></div>
      <p className="mt-1 text-xs text-navy-subtle">{item.kind} · from {item.createdBy} · to {item.targetOffice} · {new Date(item.createdAt).toLocaleString()}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm text-navy-body">{item.message}</p>
      {item.response ? <p className="mt-3 border-l-2 border-mint pl-3 text-sm text-navy-body">Response: {item.response}</p> :
        item.status === "OPEN" && item.targetOffice === office && <form onSubmit={(event) => void respond(event, item.id)} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input name="response" required minLength={2} placeholder="Write response" className="flex-1 rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
          <button disabled={busy} className="min-h-touch rounded-xl border border-navy-border px-4 text-sm">Respond</button>
        </form>}
    </article>)}</div>
    {!queries.length && <p className="text-sm text-navy-subtle">No queries or reminders recorded.</p>}
  </div>;
}

export function ConcernCommand({ initialConcerns }: { initialConcerns: SecretariatConcern[] }) {
  const [concerns, setConcerns] = useState(initialConcerns);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  async function reassign(concernId: string, targetOffice: string) {
    setBusyId(concernId); setMessage("");
    try {
      await request("/api/office/general-secretary/concerns", "PATCH", { concernId, targetOffice });
      setConcerns((current) => current.map((item) => item.id === concernId ? { ...item, targetOfficeSlug: targetOffice } : item));
      setMessage("Concern reassigned and recorded in the audit trail.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not reassign concern"); }
    finally { setBusyId(""); }
  }
  const now = Date.now();
  return <div className="space-y-3">
    <StatusMessage text={message} />
    {concerns.map((item) => {
      const stale = item.status !== "RESOLVED" && item.status !== "DECLINED" && now - new Date(item.updatedAt).getTime() > 72 * 60 * 60 * 1000;
      return <article key={item.id} className="rounded-2xl border border-navy-border bg-navy-card p-5">
        <div className="flex flex-wrap justify-between gap-2"><strong className="text-navy-heading">{item.subject}</strong><div className="flex gap-2 text-[10px] font-bold"><span className="text-mint">{item.status}</span>{stale && <span className="text-amber-300">STALE · 72h+</span>}</div></div>
        <p className="mt-1 text-xs text-navy-subtle">{item.category} · assigned {item.targetOfficeSlug} · received {new Date(item.createdAt).toLocaleString()}{item.isAnonymous ? " · anonymous identity withheld" : ""}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm text-navy-body">{item.message}</p>
        <div className="mt-3 flex flex-wrap gap-2"><select id={`reassign-${item.id}`} defaultValue={item.targetOfficeSlug} className="rounded-lg border border-navy-border bg-navy-bgStart p-2 text-xs">{EXECUTIVES_LIST.map((executive) => <option key={executive.officeSlug} value={executive.officeSlug}>{executive.position}</option>)}</select>
          <button disabled={busyId === item.id} onClick={() => {
            const target = document.getElementById(`reassign-${item.id}`) as HTMLSelectElement | null;
            if (target && target.value !== item.targetOfficeSlug) void reassign(item.id, target.value);
          }} className="min-h-touch rounded-lg border border-navy-border px-3 text-xs">Reassign / escalate</button>
          <button disabled={busyId === item.id} onClick={() => void reassign(item.id, "president")} className="min-h-touch rounded-lg border border-navy-border px-3 text-xs">Escalate to President</button></div>
      </article>;
    })}
    {!concerns.length && <p className="text-sm text-navy-subtle">No concerns are open across the offices.</p>}
  </div>;
}

export function ScorecardPromiseEditor({ initialPromises }: { initialPromises: PromiseRow[] }) {
  const [rows, setRows] = useState(initialPromises);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event: React.FormEvent<HTMLFormElement>, id?: string) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const element = event.currentTarget;
    try {
      const result = await request("/api/office/scorecard-promises", "POST", {
        ...(id ? { id } : {}), title: form.get("title"), description: form.get("description"),
        baseline: form.get("baseline") || null, target: form.get("target") || null,
        delivered: form.get("delivered") || null, isPublished: form.get("isPublished") === "on",
      }) as PromiseRow;
      setRows((current) => [result, ...current.filter((row) => row.id !== result.id)]);
      setMessage("Promise and delivery record saved.");
      if (!id) element.reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save scorecard"); }
    finally { setBusy(false); }
  }
  function fields(item?: PromiseRow) {
    return <>
      <input name="title" required minLength={3} defaultValue={item?.title} placeholder="Promise" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <textarea name="description" defaultValue={item?.description} placeholder="Description" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <input name="baseline" defaultValue={item?.baseline ?? ""} placeholder="Baseline" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <input name="target" defaultValue={item?.target ?? ""} placeholder="Target" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <input name="delivered" defaultValue={item?.delivered ?? ""} placeholder="Delivered" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" />
      <label className="flex items-center gap-2 text-xs text-navy-body"><input name="isPublished" type="checkbox" defaultChecked={item?.isPublished} /> Published publicly</label>
    </>;
  }
  return <div className="space-y-4"><StatusMessage text={message} />
    <form onSubmit={(event) => void save(event)} className="grid gap-3 rounded-2xl border border-navy-border bg-navy-card p-5 md:grid-cols-2"><h2 className="font-bold md:col-span-2">Add promised vs delivered</h2>{fields()}<button disabled={busy} className="min-h-touch rounded-xl bg-mint px-4 font-bold text-navy-bgStart md:col-span-2">Save promise</button></form>
    {rows.map((item) => <form key={item.id} onSubmit={(event) => void save(event, item.id)} className="grid gap-3 rounded-2xl border border-navy-border bg-navy-card p-5 md:grid-cols-2">{fields(item)}<button disabled={busy} className="min-h-touch rounded-xl border border-navy-border px-4 md:col-span-2">Update promise</button></form>)}
  </div>;
}

export function SiwesModerationQueue({ placements, alumni, removals }: { placements: SiwesEntry[]; alumni: AlumnusEntry[]; removals: RemovalEntry[] }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function decide(kind: string, id: string, approved?: boolean) {
    setBusy(true); setMessage("");
    try {
      await request("/api/office/secretariat/siwes", "POST", {
        kind, id, ...(approved === undefined ? {} : kind === "resolve-removal" ? { resolved: approved } : { approved }),
      });
      setMessage("Submitted for required approval.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit action"); }
    finally { setBusy(false); }
  }

  return <div className="space-y-5">
    <StatusMessage text={message} />
    <section className="space-y-3"><h2 className="font-bold text-navy-heading">SIWES placement queue</h2>
      {placements.map((item) => <article key={item.id} className="rounded-2xl border border-navy-border bg-navy-card p-4">
        <strong className="text-navy-heading">{item.studentName}</strong><p className="mt-1 text-sm text-navy-body">{item.level} · {item.role} at {item.company}</p>
        <p className="mt-1 text-xs text-navy-subtle">{item.consentGiven ? "Consent recorded" : "Consent not recorded"}</p>
        <div className="mt-3 flex gap-2"><button disabled={busy} onClick={() => void decide("placement", item.id, true)} className="min-h-touch rounded-lg border border-mint px-3 text-xs text-mint">Approve</button><button disabled={busy} onClick={() => void decide("placement", item.id, false)} className="min-h-touch rounded-lg border border-navy-border px-3 text-xs">Reject</button><button disabled={busy} onClick={() => void decide("remove-placement", item.id)} className="min-h-touch rounded-lg border border-navy-border px-3 text-xs">Request removal</button></div>
      </article>)}
      {!placements.length && <p className="text-sm text-navy-subtle">No pending placement entries.</p>}
    </section>
    <section className="space-y-3"><h2 className="font-bold text-navy-heading">Alumni queue</h2>
      {alumni.map((item) => <article key={item.id} className="rounded-2xl border border-navy-border bg-navy-card p-4">
        <strong className="text-navy-heading">{item.name}</strong><p className="mt-1 text-sm text-navy-body">{item.graduationYear} · {item.currentRole} at {item.currentCompany}</p>
        <p className="mt-1 text-xs text-navy-subtle">{item.consentGiven ? "Consent recorded" : "Consent not recorded"}</p>
        <div className="mt-3 flex gap-2"><button disabled={busy} onClick={() => void decide("alumnus", item.id, true)} className="min-h-touch rounded-lg border border-mint px-3 text-xs text-mint">Approve</button><button disabled={busy} onClick={() => void decide("alumnus", item.id, false)} className="min-h-touch rounded-lg border border-navy-border px-3 text-xs">Reject</button><button disabled={busy} onClick={() => void decide("remove-alumnus", item.id)} className="min-h-touch rounded-lg border border-navy-border px-3 text-xs">Request removal</button></div>
      </article>)}
      {!alumni.length && <p className="text-sm text-navy-subtle">No pending alumni entries.</p>}
    </section>
    <section className="space-y-3"><h2 className="font-bold text-navy-heading">Removal requests</h2>
      {removals.filter((item) => !item.isResolved).map((item) => <article key={item.id} className="rounded-2xl border border-navy-border bg-navy-card p-4">
        <strong className="text-navy-heading">{item.targetType} removal request</strong><p className="mt-1 text-sm text-navy-body">{item.reason}</p>
        <button disabled={busy} onClick={() => void decide("resolve-removal", item.id, true)} className="mt-3 min-h-touch rounded-lg border border-navy-border px-3 text-xs">Submit resolution for approval</button>
      </article>)}
      {!removals.some((item) => !item.isResolved) && <p className="text-sm text-navy-subtle">No open removal requests.</p>}
    </section>
  </div>;
}

export function ExecutiveDirectoryWorkspace({ initialEntries }: { initialEntries: DirectoryEntry[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event: React.FormEvent<HTMLFormElement>, entry: DirectoryEntry) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await request("/api/office/general-secretary/directory", "PATCH", {
        officeSlug: entry.officeSlug,
        name: form.get("name"),
        officeEmail: form.get("officeEmail"),
        isListed: form.get("isListed") === "on",
        emailConsent: form.get("emailConsent") === "on",
        photoUrl: form.get("photoUrl") || null,
      }) as DirectoryEntry;
      setEntries((current) => current.map((item) => item.officeSlug === response.officeSlug ? response : item));
      setMessage(`${entry.position} directory entry saved.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update directory"); }
    finally { setBusy(false); }
  }
  return <div className="space-y-3"><StatusMessage text={message} />
    {entries.map((entry) => <form key={entry.officeSlug} onSubmit={(event) => void save(event, entry)} className="grid gap-3 rounded-2xl border border-navy-border bg-navy-card p-5 md:grid-cols-2">
      <h2 className="font-bold text-navy-heading md:col-span-2">{entry.position}</h2>
      <input name="name" defaultValue={entry.name} required className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" aria-label={`${entry.position} directory name`} />
      <input name="officeEmail" defaultValue={entry.officeEmail} type="email" required className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" aria-label={`${entry.position} office email`} />
      <input name="photoUrl" defaultValue={entry.photoUrl ?? ""} placeholder="/placeholder-image.svg" className="rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm" aria-label={`${entry.position} photo path`} />
      <div className="flex gap-4 text-xs text-navy-body"><label className="flex items-center gap-2"><input name="isListed" type="checkbox" defaultChecked={entry.isListed} /> Listed</label><label className="flex items-center gap-2"><input name="emailConsent" type="checkbox" defaultChecked={entry.emailConsent} /> Email consent</label></div>
      <button disabled={busy} className="min-h-touch rounded-xl border border-navy-border px-4 text-sm md:col-span-2">Save directory entry</button>
    </form>)}
    {!entries.length && <p className="text-sm text-navy-subtle">No executive records are available to manage.</p>}
  </div>;
}
