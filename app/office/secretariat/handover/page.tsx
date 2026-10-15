import { requirePageCapability } from "@/lib/office-access";
import { getHandoverPackData } from "@/lib/secretariat";
import PrintButton from "@/components/office/PrintButton";

export default async function HandoverPackPage() {
  await requirePageCapability("gensec.documents.manage");
  const pack = await getHandoverPackData();
  const meetingTitles = new Map(pack.meetings.map((meeting) => [meeting.id, meeting.title]));
  return <section className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-widest text-mint">Secretariat archive</p><h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Executive handover pack</h1>
        <p className="mt-1 text-sm text-navy-body">Generated {pack.generatedAt.toLocaleString()}. Use your browser’s print dialog to save this summary as PDF.</p></div>
      <PrintButton />
    </header>
    <section className="grid gap-3 sm:grid-cols-4">
      {[["Minutes", pack.minutes.length], ["Tasks", pack.tasks.length], ["Reports", pack.reports.length], ["Published decisions", pack.digests.filter((item) => item.publishedAt).length]].map(([label, count]) => <article key={String(label)} className="rounded-xl border border-navy-border bg-navy-card p-4"><p className="text-xs text-navy-subtle">{label}</p><p className="mt-1 text-2xl font-bold text-navy-heading">{count}</p></article>)}
    </section>
    <section className="space-y-2 rounded-2xl border border-navy-border bg-navy-card p-5"><h2 className="font-bold text-navy-heading">Approved meeting minutes</h2>
      {pack.minutes.filter((item) => item.status === "LOCKED").map((item) => <article key={item.id} className="border-t border-navy-border py-3"><strong>{meetingTitles.get(item.meetingId) ?? "Executive meeting"}</strong><p className="mt-1 whitespace-pre-wrap text-sm text-navy-body">{item.content || "No notes."}</p></article>)}
    </section>
    <section className="space-y-2 rounded-2xl border border-navy-border bg-navy-card p-5"><h2 className="font-bold text-navy-heading">Decision digests</h2>
      {pack.digests.filter((item) => item.publishedAt).map((item) => <article key={item.id} className="border-t border-navy-border py-3"><strong>{item.title}</strong><p className="mt-1 whitespace-pre-wrap text-sm text-navy-body">{item.content}</p></article>)}
    </section>
    <section className="space-y-2 rounded-2xl border border-navy-border bg-navy-card p-5"><h2 className="font-bold text-navy-heading">Executive reports</h2>
      {pack.reports.map((item) => <article key={item.id} className="border-t border-navy-border py-3"><strong>{item.title}</strong><p className="text-xs text-navy-subtle">{item.office} · {item.submittedAt.toLocaleDateString()}</p><p className="mt-1 text-sm text-navy-body">{item.summary}</p></article>)}
    </section>
    <section className="space-y-2 rounded-2xl border border-navy-border bg-navy-card p-5"><h2 className="font-bold text-navy-heading">Tasks</h2>
      {pack.tasks.map((item) => <article key={item.id} className="border-t border-navy-border py-3"><strong>{item.title}</strong><p className="text-xs text-navy-subtle">{item.assignedToOffice} · {item.status}{item.dueDate ? ` · due ${item.dueDate.toLocaleDateString()}` : ""}</p></article>)}
    </section>
  </section>;
}
