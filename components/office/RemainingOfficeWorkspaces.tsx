"use client";

import { useState } from "react";

type Dues = { id: string; memberCode: string; displayName: string; level: string; status: string; amountPaid: number; receiptRef: string | null };
type FinanceQuery = { id: string; trackingId: string; subject: string; message: string; isAnonymous: boolean; senderName: string | null; senderEmail: string | null; status: string };
type Reminder = { id: string; title: string; body: string };
type Ledger = { id: string; kind: string; title: string; office: string; event: string | null; term: string; amount: number; receiptRef: string | null };
type Expenditure = { id: string; title: string; purpose: string; office: string; event: string | null; amount: number; status: string; requestedBy: string };
type SportsData = {
  teams: Array<{ id: string; name: string; category: string; roster: string }>;
  fixtures: Array<{ id: string; team: string; opponent: string; venue: string; startsAt: string; result: string | null }>;
  training: Array<{ id: string; team: string; venue: string; startsAt: string; notes: string }>;
  equipment: Array<{ id: string; name: string; quantity: number; condition: string }>;
  signups: Array<{ id: string; name: string; sport: string; level: string }>;
  achievements: Array<{ id: string; title: string; details: string; achievedAt: string }>;
};
type WelfareData = {
  cases: Array<{ id: string; trackingId: string; subject: string; message: string; isAnonymous: boolean; senderName: string | null; senderEmail: string | null; status: string }>;
  referrals: Array<{ id: string; name: string; service: string; contact: string; description: string }>;
  drives: Array<{ id: string; title: string; description: string; startsAt: string; endsAt: string }>;
  resources: Array<{ id: string; title: string; description: string; link: string | null }>;
};

const inputClass = "rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm text-navy-heading";
const buttonClass = "min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-onAccent";

async function requestJson(url: string, method: string, body: unknown) {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed.");
  return result.data;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5"><h2 className="font-bold text-navy-heading">{title}</h2>{children}</section>;
}

function ReceiptUploader({ onUploaded }: { onUploaded: (receiptId: string) => void }) {
  const [notice, setNotice] = useState("");
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.set("file", file);
    try {
      const response = await fetch("/api/office/treasurer/receipts", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not upload receipt.");
      onUploaded(result.data.id);
      setNotice(`Receipt uploaded; reference ${result.data.id}`);
      event.target.value = "";
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not upload receipt."); }
  }
  return <div className="space-y-1"><label className="block text-xs text-navy-subtle">Upload receipt (PDF, JPEG, PNG, WebP; max 10 MB)<input className="mt-1 block text-sm" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => void upload(event)} /></label>{notice && <p role="status" className="text-xs text-mint">{notice}</p>}</div>;
}

export function FinancialSecretaryWorkspace({ initialData }: { initialData: { dues: Dues[]; queries: FinanceQuery[]; reminders: Reminder[]; monthlyDues: { paidCount: number; recordedAmount: number } } }) {
  const [data, setData] = useState(initialData);
  const [notice, setNotice] = useState("");
  const [receiptRef, setReceiptRef] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>, action: "DUES" | "REMINDER") {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = action === "DUES"
      ? {
          action,
          memberCode: form.get("memberCode"),
          displayName: form.get("displayName"),
          level: form.get("level"),
          status: form.get("status"),
          amountPaid: Number(form.get("amountPaid") || 0),
          receiptRef: receiptRef || form.get("receiptRef") || null,
        }
      : { action, title: form.get("title"), body: form.get("body") };
    try {
      const saved = await requestJson("/api/office/financial-secretary", "POST", payload);
      if (action === "DUES") setData((current) => ({ ...current, dues: [saved as Dues, ...current.dues.filter((item) => item.memberCode !== (saved as Dues).memberCode)] }));
      else setData((current) => ({ ...current, reminders: [saved as Reminder, ...current.reminders] }));
      formElement.reset();
      if (action === "DUES") setReceiptRef("");
      setNotice(action === "DUES" ? "Dues record saved (record keeping only)." : "Reminder draft handed to the PRO.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save this record."); }
  }
  return <div className="space-y-5">
    {notice && <p role="status" className="text-sm text-mint">{notice}</p>}
    <Panel title="Mock dues tracker">
      <p className="text-xs text-navy-subtle">Demo records only. This tracker does not collect payments or process transactions.</p>
      <form className="grid gap-2 md:grid-cols-3" onSubmit={(event) => void submit(event, "DUES")}>
        <input className={inputClass} name="memberCode" required maxLength={40} placeholder="Mock member code" />
        <input className={inputClass} name="displayName" required maxLength={100} placeholder="Placeholder member name" />
        <input className={inputClass} name="level" required maxLength={30} placeholder="Level" />
        <select className={inputClass} name="status"><option value="UNPAID">Unpaid</option><option value="PAID">Paid (record only)</option></select>
        <input className={inputClass} name="amountPaid" type="number" min="0" max="1000000" step="0.01" placeholder="Recorded amount" />
        <ReceiptUploader onUploaded={setReceiptRef} />
        <button className={buttonClass}>Save dues record</button>
      </form>
      <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="text-navy-subtle"><th className="p-2">Code</th><th>Name</th><th>Level</th><th>Status</th><th>Amount recorded</th><th>Receipt</th></tr></thead><tbody>{data.dues.map((item) => <tr key={item.id} className="border-t border-navy-border"><td className="p-2">{item.memberCode}</td><td>{item.displayName}</td><td>{item.level}</td><td>{item.status}</td><td>₦{item.amountPaid.toLocaleString()}</td><td>{item.receiptRef ? <a className="text-mint underline" href={`/api/office/treasurer/receipts/${encodeURIComponent(item.receiptRef)}`}>view receipt</a> : "—"}</td></tr>)}</tbody></table></div>
      <p className="text-xs text-navy-subtle">This month: {data.monthlyDues.paidCount} paid records · ₦{data.monthlyDues.recordedAmount.toLocaleString()} recorded.</p>
    </Panel>
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel title="Reminder drafts for PRO">
        <form className="grid gap-2" onSubmit={(event) => void submit(event, "REMINDER")}>
          <input className={inputClass} name="title" required minLength={3} maxLength={120} placeholder="Reminder title" />
          <textarea className={inputClass} name="body" required minLength={10} maxLength={2000} placeholder="Reminder copy" rows={4} />
          <button className={buttonClass}>Hand draft to PRO</button>
        </form>
        <ul className="space-y-2 text-sm text-navy-body">{data.reminders.map((item) => <li key={item.id}><strong>{item.title}</strong><p>{item.body}</p></li>)}</ul>
      </Panel>
      <Panel title="Financial-queries inbox">
        {data.queries.length ? <ul className="space-y-3">{data.queries.map((item) => <li key={item.id} className="border-b border-navy-border pb-3 text-sm"><strong className="text-navy-heading">{item.subject}</strong><p className="mt-1 text-xs text-navy-subtle">{item.trackingId} · {item.status} · {item.isAnonymous ? "Anonymous sender" : item.senderName || "Sender details unavailable"}</p><p className="mt-1 text-navy-body">{item.message}</p></li>)}</ul> : <p className="text-sm text-navy-subtle">No financial queries yet.</p>}
      </Panel>
    </div>
  </div>;
}

export function TreasurerWorkspace({ initialData }: { initialData: { ledger: Ledger[]; requests: Expenditure[]; budgets: Array<{ id: string; scope: string; term: string; planned: number; actual: number; remaining: number }>; termStatements: Array<{ term: string; income: number; expenditure: number }> } }) {
  const [data, setData] = useState(initialData);
  const [notice, setNotice] = useState("");
  const [receiptRef, setReceiptRef] = useState("");
  async function record(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      const entry = await requestJson("/api/office/treasurer", "POST", {
        kind: form.get("kind"), title: form.get("title"), office: form.get("office"), event: form.get("event") || null,
        amount: Number(form.get("amount")), term: form.get("term"), receiptRef: receiptRef || null,
      }) as Ledger;
      setData((current) => ({ ...current, ledger: [entry, ...current.ledger] }));
      formElement.reset();
      setReceiptRef("");
      setNotice("Ledger entry recorded only; no money was moved.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not record ledger entry."); }
  }
  async function saveBudget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      await requestJson("/api/office/treasurer", "POST", {
        kind: "BUDGET", scopeType: form.get("scopeType"), scopeName: form.get("scopeName"),
        amount: Number(form.get("amount")), term: form.get("term"),
      });
      const response = await fetch("/api/office/treasurer");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not refresh budgets.");
      setData((current) => ({ ...current, budgets: result.data.budgets }));
      formElement.reset(); setNotice("Budget plan saved.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save budget plan."); }
  }
  return <div className="space-y-5">
    {notice && <p role="status" className="text-sm text-mint">{notice}</p>}
    <Panel title="Funds ledger (record only)">
      <p className="text-xs text-navy-subtle">The ledger does not integrate with banks, payment providers, or money movement.</p>
      <form className="grid gap-2 md:grid-cols-3" onSubmit={(event) => void record(event)}>
        <select className={inputClass} name="kind"><option value="INCOME">Income record</option><option value="EXPENDITURE">Expenditure record</option></select>
        <input className={inputClass} name="title" required minLength={3} maxLength={160} placeholder="Description" />
        <input className={inputClass} name="office" required maxLength={80} placeholder="Responsible office" />
        <input className={inputClass} name="event" maxLength={160} placeholder="Event (optional)" />
        <input className={inputClass} name="term" required minLength={2} maxLength={60} defaultValue="CURRENT" placeholder="Term" />
        <input className={inputClass} name="amount" required type="number" min="0.01" max="100000000" step="0.01" placeholder="Amount recorded" />
        <ReceiptUploader onUploaded={setReceiptRef} />
        <button className={buttonClass}>Record entry</button>
      </form>
      <ul className="space-y-2 text-sm text-navy-body">{data.ledger.map((entry) => <li key={entry.id} className="flex justify-between gap-3 border-t border-navy-border pt-2"><span>{entry.kind} · {entry.title} · {entry.office}{entry.event ? ` / ${entry.event}` : ""}{entry.receiptRef && <a className="ml-2 text-mint underline" href={`/api/office/treasurer/receipts/${encodeURIComponent(entry.receiptRef)}`}>receipt</a>}</span><span>₦{entry.amount.toLocaleString()}</span></li>)}</ul>
      <p className="font-bold text-navy-heading">Term statements:</p>
      <ul className="space-y-1 text-sm text-navy-body">{data.termStatements.map((item) => <li key={item.term}>{item.term}: ₦{item.income.toLocaleString()} income · ₦{item.expenditure.toLocaleString()} expenditure · net ₦{(item.income - item.expenditure).toLocaleString()}</li>)}</ul>
    </Panel>
    <Panel title="Budget against actual by office or event">
      <form className="grid gap-2 md:grid-cols-4" onSubmit={(event) => void saveBudget(event)}>
        <select className={inputClass} name="scopeType"><option value="OFFICE">Office</option><option value="EVENT">Event</option></select>
        <input className={inputClass} name="scopeName" required minLength={2} maxLength={160} placeholder="Office or event name" />
        <input className={inputClass} name="amount" required type="number" min="0.01" max="100000000" step="0.01" placeholder="Budget amount" />
        <input className={inputClass} name="term" required minLength={2} maxLength={60} placeholder="Term / month" />
        <button className={buttonClass}>Save budget</button>
      </form>
      {data.budgets.length ? <ul className="space-y-2 text-sm text-navy-body">{data.budgets.map((item) => <li key={item.id}>{item.scope} · {item.term}: plan ₦{item.planned.toLocaleString()} · actual ₦{item.actual.toLocaleString()} · remaining ₦{item.remaining.toLocaleString()}</li>)}</ul> : <p className="text-sm text-navy-subtle">No budget plans yet.</p>}
    </Panel>
    <Panel title="Expenditure requests">
      <ul className="space-y-2 text-sm text-navy-body">{data.requests.map((item) => <li key={item.id} className="border-t border-navy-border pt-2"><strong>{item.title}</strong> · ₦{item.amount.toLocaleString()} · {item.office}{item.event ? ` / ${item.event}` : ""} · {item.status}<p>{item.purpose}</p></li>)}</ul>
      <p className="text-xs text-navy-subtle">Treasurer approval is first. Amounts above the configured limit also require President approval before a record is posted to the ledger.</p>
    </Panel>
  </div>;
}

export function ExpenditureRequestForm() {
  const [notice, setNotice] = useState("");
  const [receiptRef, setReceiptRef] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      await requestJson("/api/office/expenditure", "POST", {
        title: form.get("title"), purpose: form.get("purpose"), office: form.get("office"), event: form.get("event") || null,
        amount: Number(form.get("amount")), term: form.get("term"), receiptRef: receiptRef || null,
      });
      formElement.reset();
      setReceiptRef("");
      setNotice("Request sent to the Treasurer for review.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not submit request."); }
  }
  return <Panel title="Submit an expenditure request">
    {notice && <p role="status" className="text-sm text-mint">{notice}</p>}
    <p className="text-xs text-navy-subtle">Any executive office may submit. This is an approval and record-keeping workflow only; it never moves money.</p>
    <form className="grid gap-2" onSubmit={(event) => void submit(event)}>
      <input className={inputClass} name="title" required minLength={3} maxLength={160} placeholder="Request title" />
      <textarea className={inputClass} name="purpose" required minLength={10} maxLength={3000} placeholder="Purpose and justification" rows={4} />
      <input className={inputClass} name="office" required maxLength={80} placeholder="Responsible office" />
      <input className={inputClass} name="event" maxLength={160} placeholder="Event (optional)" />
      <input className={inputClass} name="term" required minLength={2} maxLength={60} defaultValue="CURRENT" placeholder="Term" />
      <input className={inputClass} name="amount" required type="number" min="0.01" max="100000000" step="0.01" placeholder="Amount requested" />
      <ReceiptUploader onUploaded={setReceiptRef} />
      <button className={buttonClass}>Submit for Treasurer review</button>
    </form>
  </Panel>;
}

export function SportsSecretaryWorkspace({ initialData }: { initialData: SportsData }) {
  const [data, setData] = useState(initialData);
  const [notice, setNotice] = useState("");
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      const kind = String(form.get("kind"));
      const result = await requestJson("/api/office/sports", "POST", {
        kind, title: form.get("title"), details: form.get("details"), venue: form.get("venue"),
        roster: kind === "TEAM" ? String(form.get("roster") || "").split(",").map((name) => name.trim()).filter(Boolean) : undefined,
        date: form.get("date") ? new Date(String(form.get("date"))).toISOString() : undefined,
        quantity: form.get("quantity") ? Number(form.get("quantity")) : undefined,
      });
      if (kind === "TEAM") setData((current) => ({ ...current, teams: [result as SportsData["teams"][number], ...current.teams] }));
      if (kind === "FIXTURE") setData((current) => ({ ...current, fixtures: [result as SportsData["fixtures"][number], ...current.fixtures] }));
      if (kind === "TRAINING") setData((current) => ({ ...current, training: [result as SportsData["training"][number], ...current.training] }));
      if (kind === "EQUIPMENT") setData((current) => ({ ...current, equipment: [result as SportsData["equipment"][number], ...current.equipment] }));
      if (kind === "ACHIEVEMENT") setData((current) => ({ ...current, achievements: [result as SportsData["achievements"][number], ...current.achievements] }));
      formElement.reset(); setNotice("Sports record saved.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save sports record."); }
  }
  async function saveResult(event: React.FormEvent<HTMLFormElement>, fixtureId: string) {
    event.preventDefault(); const formElement = event.currentTarget; const result = String(new FormData(formElement).get("result") ?? "");
    try {
      await requestJson("/api/office/sports", "PATCH", { fixtureId, result });
      setData((current) => ({ ...current, fixtures: current.fixtures.map((item) => item.id === fixtureId ? { ...item, result } : item) }));
      setNotice("Fixture result recorded.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save result."); }
  }
  return <div className="space-y-5">
    {notice && <p role="status" className="text-sm text-mint">{notice}</p>}
    <Panel title="Teams, roster categories, fixtures, training, equipment, achievements">
      <form className="grid gap-2 md:grid-cols-2" onSubmit={(event) => void create(event)}>
        <select name="kind" className={inputClass}><option value="TEAM">Team</option><option value="FIXTURE">Fixture</option><option value="TRAINING">Training session</option><option value="EQUIPMENT">Equipment item</option><option value="ACHIEVEMENT">Achievement</option></select>
        <input name="title" className={inputClass} required minLength={2} maxLength={160} placeholder="Team / event / item title" />
        <input name="details" className={inputClass} required minLength={2} maxLength={2000} placeholder="Category / opponent / venue / details" />
        <input name="roster" className={inputClass} maxLength={5000} placeholder="Team roster (comma-separated mock names)" />
        <input name="venue" className={inputClass} maxLength={200} placeholder="Fixture venue (optional)" />
        <input name="date" type="datetime-local" className={inputClass} />
        <input name="quantity" type="number" min="0" max="10000" className={inputClass} placeholder="Equipment quantity (optional)" />
        <button className={buttonClass}>Save sports record</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        <ul className="space-y-2 text-sm text-navy-body"><li className="font-bold text-navy-heading">Teams and rosters</li>{data.teams.map((item) => <li key={item.id}>{item.name} · {item.category} · {JSON.parse(item.roster).join(", ") || "Roster not entered"}</li>)}</ul>
        <ul className="space-y-2 text-sm text-navy-body"><li className="font-bold text-navy-heading">Equipment inventory</li>{data.equipment.map((item) => <li key={item.id}>{item.name} · {item.quantity} · {item.condition}</li>)}</ul>
        <ul className="space-y-2 text-sm text-navy-body"><li className="font-bold text-navy-heading">Training schedule</li>{data.training.map((item) => <li key={item.id}>{item.team} · {item.venue} · {new Date(item.startsAt).toLocaleString()}</li>)}</ul>
        <ul className="space-y-2 text-sm text-navy-body"><li className="font-bold text-navy-heading">Achievements</li>{data.achievements.map((item) => <li key={item.id}>{item.title} · {item.details}</li>)}</ul>
      </div>
      <div className="space-y-3"><h3 className="font-bold text-navy-heading">Fixtures and results</h3>{data.fixtures.map((item) => <div key={item.id} className="rounded-lg border border-navy-border p-3 text-sm text-navy-body">{item.team} vs {item.opponent} · {item.venue} · {new Date(item.startsAt).toLocaleString()} · {item.result || "Result pending"}<form className="mt-2 flex gap-2" onSubmit={(event) => void saveResult(event, item.id)}><input className={inputClass} name="result" required maxLength={120} placeholder="Score / result" /><button className={buttonClass}>Record result</button></form></div>)}</div>
      <div><h3 className="font-bold text-navy-heading">Sports sign-ups (demo names)</h3><ul className="mt-2 space-y-1 text-sm text-navy-body">{data.signups.map((item) => <li key={item.id}>{item.name} · {item.sport} · {item.level}</li>)}</ul></div>
    </Panel>
  </div>;
}

export function WelfareSecretaryWorkspace({ initialData }: { initialData: WelfareData }) {
  const [data, setData] = useState(initialData);
  const [notice, setNotice] = useState("");
  async function updateCase(id: string, status: string) {
    try {
      await requestJson("/api/office/welfare", "PATCH", { action: "STATUS", id, status });
      setData((current) => ({ ...current, cases: current.cases.map((item) => item.id === id ? { ...item, status } : item) }));
      setNotice("Confidential case status updated.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not update case."); }
  }
  async function addResource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    try {
      await requestJson("/api/office/welfare", "POST", {
        action: form.get("kind"), title: form.get("title"), description: form.get("description"),
        contact: form.get("contact"), link: form.get("link") || undefined,
        startsAt: form.get("startsAt") ? new Date(String(form.get("startsAt"))).toISOString() : undefined,
        endsAt: form.get("endsAt") ? new Date(String(form.get("endsAt"))).toISOString() : undefined,
      });
      formElement.reset(); setNotice("Welfare resource saved.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save welfare resource."); }
  }
  return <div className="space-y-5">
    {notice && <p role="status" className="text-sm text-mint">{notice}</p>}
    <Panel title="Confidential case inbox">
      <p className="text-xs font-bold text-amber-300">Visible only to the Welfare Secretary and President. Anonymous sender identity is not retained or shown.</p>
      {data.cases.map((item) => <article key={item.id} className="space-y-2 border-t border-navy-border pt-3"><div className="flex flex-wrap justify-between gap-2"><strong className="text-navy-heading">{item.subject}</strong><span className="text-xs text-navy-subtle">{item.trackingId} · {item.status}</span></div><p className="text-sm text-navy-body">{item.message}</p><p className="text-xs text-navy-subtle">{item.isAnonymous ? "Anonymous sender" : item.senderName || "Sender not provided"}{!item.isAnonymous && item.senderEmail ? ` · ${item.senderEmail}` : ""}</p><select className={inputClass} value={item.status} onChange={(event) => void updateCase(item.id, event.target.value)}><option>OPEN</option><option>IN_PROGRESS</option><option>REFERRED</option><option>CLOSED</option></select></article>)}
      {!data.cases.length && <p className="text-sm text-navy-subtle">No cases in the confidential inbox.</p>}
    </Panel>
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel title="Referral directory, welfare drives and wellbeing resources">
        <form className="grid gap-2" onSubmit={(event) => void addResource(event)}>
          <select className={inputClass} name="kind"><option value="REFERRAL">Referral contact</option><option value="DRIVE">Welfare drive</option><option value="RESOURCE">Wellbeing resource</option></select>
          <input className={inputClass} name="title" required minLength={2} maxLength={160} placeholder="Title / service" />
          <textarea className={inputClass} name="description" required minLength={3} maxLength={3000} placeholder="Description" />
          <input className={inputClass} name="contact" maxLength={240} placeholder="Referral contact details" />
          <input className={inputClass} name="link" type="url" maxLength={1000} placeholder="Resource link (https://...)" />
          <input className={inputClass} name="startsAt" type="datetime-local" aria-label="Drive start" />
          <input className={inputClass} name="endsAt" type="datetime-local" aria-label="Drive end" />
          <button className={buttonClass}>Save welfare resource</button>
        </form>
        <h3 className="font-bold text-navy-heading">Referrals</h3><ul className="space-y-1 text-sm text-navy-body">{data.referrals.map((item) => <li key={item.id}>{item.name} · {item.service} · {item.contact}</li>)}</ul>
        <h3 className="font-bold text-navy-heading">Drives</h3><ul className="space-y-1 text-sm text-navy-body">{data.drives.map((item) => <li key={item.id}>{item.title} · {new Date(item.startsAt).toLocaleDateString()}–{new Date(item.endsAt).toLocaleDateString()}</li>)}</ul>
        <h3 className="font-bold text-navy-heading">Resources</h3><ul className="space-y-1 text-sm text-navy-body">{data.resources.map((item) => <li key={item.id}>{item.link ? <a className="text-mint underline" href={item.link} rel="noreferrer">{item.title}</a> : item.title} · {item.description}</li>)}</ul>
      </Panel>
    </div>
  </div>;
}
