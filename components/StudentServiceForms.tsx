"use client";

import { useState } from "react";

const fieldClass = "w-full rounded-lg border border-navy-border bg-navy-bgStart p-3 text-sm text-navy-heading";

async function submitJson(url: string, data: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Request failed.");
  return result;
}

function PublicForm({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5"><h2 className="text-lg font-bold text-navy-heading">{title}</h2>{children}</section>;
}

export function FinanceQueryForm() {
  const [notice, setNotice] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const result = await submitJson("/api/finance/queries", {
        subject: data.get("subject"), message: data.get("message"), isAnonymous: data.get("anonymous") === "on",
        senderName: data.get("name") || undefined, senderEmail: data.get("email") || undefined,
      });
      form.reset();
      setNotice(`Your query was received. Tracking reference: ${result.trackingId}`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not submit your query."); }
  }
  return <PublicForm title="Ask a financial question">
    <p className="text-xs text-navy-subtle">Do not include bank details, passwords, or sensitive personal data. Anonymous contact fields are discarded.</p>
    <form className="grid gap-2" onSubmit={(event) => void submit(event)}>
      <input className={fieldClass} name="subject" required minLength={3} maxLength={160} placeholder="Subject" />
      <textarea className={fieldClass} name="message" required minLength={10} maxLength={3000} rows={4} placeholder="Your question" />
      <input className={fieldClass} name="name" maxLength={100} placeholder="Name (optional)" />
      <input className={fieldClass} name="email" type="email" maxLength={254} placeholder="Email (optional)" />
      <label className="flex items-center gap-2 text-sm text-navy-body"><input name="anonymous" type="checkbox" /> Submit anonymously</label>
      <button className="min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-onAccent">Send query</button>
    </form>
    {notice && <p role="status" className="text-sm text-mint">{notice}</p>}
  </PublicForm>;
}

export function WelfareCaseForm() {
  const [notice, setNotice] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const result = await submitJson("/api/welfare/cases", {
        subject: data.get("subject"), message: data.get("message"), isAnonymous: data.get("anonymous") === "on",
        senderName: data.get("name") || undefined, senderEmail: data.get("email") || undefined,
      });
      form.reset();
      setNotice(`Your confidential case was received. Keep this reference: ${result.trackingId}`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not submit your case."); }
  }
  return <PublicForm title="Send a confidential welfare concern">
    <p className="text-xs text-navy-subtle">Only the Welfare Secretary and President can access the case inbox. Anonymous sender details are not stored or shown. Do not use this demo for emergencies or real personal data.</p>
    <form className="grid gap-2" onSubmit={(event) => void submit(event)}>
      <input className={fieldClass} name="subject" required minLength={3} maxLength={160} placeholder="Subject" />
      <textarea className={fieldClass} name="message" required minLength={10} maxLength={5000} rows={5} placeholder="Describe the support you need" />
      <input className={fieldClass} name="name" maxLength={100} placeholder="Name (optional)" />
      <input className={fieldClass} name="email" type="email" maxLength={254} placeholder="Email (optional)" />
      <label className="flex items-center gap-2 text-sm text-navy-body"><input name="anonymous" type="checkbox" /> Send anonymously</label>
      <button className="min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-onAccent">Send confidential case</button>
    </form>
    {notice && <p role="status" className="text-sm text-mint">{notice}</p>}
  </PublicForm>;
}

export function SportsSignupForm() {
  const [notice, setNotice] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await submitJson("/api/sports/signup", { name: data.get("name"), sport: data.get("sport"), level: data.get("level") });
      form.reset();
      setNotice("Signup received. Use mock names only in this prototype.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not submit signup."); }
  }
  return <PublicForm title="Sports sign-up (prototype)">
    <p className="text-xs text-navy-subtle">Use mock names only. Do not submit real student information.</p>
    <form className="grid gap-2" onSubmit={(event) => void submit(event)}>
      <input className={fieldClass} name="name" required minLength={2} maxLength={100} placeholder="Mock name" />
      <input className={fieldClass} name="sport" required minLength={2} maxLength={80} placeholder="Sport" />
      <select className={fieldClass} name="level"><option>100L</option><option>200L</option><option>300L</option><option>400L</option><option>500L</option></select>
      <button className="min-h-touch rounded-lg bg-mint px-4 text-sm font-bold text-navy-onAccent">Sign up</button>
    </form>
    {notice && <p role="status" className="text-sm text-mint">{notice}</p>}
  </PublicForm>;
}
