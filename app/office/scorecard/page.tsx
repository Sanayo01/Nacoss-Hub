import { requirePageCapability } from "@/lib/office-access";
import { getExecutiveScorecard } from "@/lib/power-office-data";

export default async function ScorecardPage() {
  await requirePageCapability("president.scorecard");
  const offices = await getExecutiveScorecard();
  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">Executive oversight</p><h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Executive scorecard</h1><p className="mt-1 text-sm text-navy-body">Read-only operational indicators for all executive offices.</p></header>
    <div className="grid gap-3 md:grid-cols-2">{offices.map((item) => <article key={item.office} className="rounded-2xl border border-navy-border bg-navy-card p-5">
      <h2 className="font-bold text-navy-heading">{item.position}</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-navy-subtle">Resolved concerns</dt><dd>{item.resolvedConcerns}</dd></div>
        <div><dt className="text-xs text-navy-subtle">Avg. response time</dt><dd>{item.averageResponseHours?.toFixed(1) ?? "No data"} h</dd></div>
        <div><dt className="text-xs text-navy-subtle">Tasks done</dt><dd>{item.tasksDone}</dd></div>
        <div><dt className="text-xs text-navy-subtle">Overdue tasks</dt><dd>{item.tasksOverdue}</dd></div>
        <div><dt className="text-xs text-navy-subtle">Meeting attendance</dt><dd>{item.attendance}</dd></div>
        <div><dt className="text-xs text-navy-subtle">Reports submitted</dt><dd>{item.reportsSubmitted}</dd></div></dl>
    </article>)}</div>
  </section>;
}
