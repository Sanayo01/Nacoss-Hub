import { requirePageCapability } from "@/lib/office-access";
import { getPlatformStats } from "@/lib/db";

export default async function OfficeReportsPage() {
  await requirePageCapability("reports.view");
  const stats = await getPlatformStats();
  const rows = [
    ["Concerns received", stats.concernsReceived],
    ["Concerns resolved", stats.concernsResolved],
    ["Median response time", stats.medianResponseTime],
    ["Approved SIWES placements", stats.activeSiwesCount],
  ];
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-mint">Department overview</p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Reports</h1>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-navy-border bg-navy-card p-5">
            <p className="text-xs uppercase tracking-widest text-navy-body">{label}</p>
            <p className="mt-2 text-2xl font-bold text-navy-heading">{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
