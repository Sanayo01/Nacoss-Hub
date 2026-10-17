import { getScorecardPromises } from "@/lib/secretariat";

export const dynamic = "force-dynamic";

export default async function PublicScorecardPage() {
  const promises = await getScorecardPromises(true);
  return <main className="mx-auto min-h-screen max-w-4xl space-y-6 px-4 py-12">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">NACOSS Hub · public records</p>
      <h1 className="mt-2 text-3xl font-extrabold text-navy-heading">Promised vs delivered</h1></header>
    <div className="space-y-3">{promises.map((item) => <article key={item.id} className="rounded-2xl border border-navy-border bg-navy-card p-5">
      <h2 className="font-bold text-navy-heading">{item.title}</h2><p className="mt-2 text-sm text-navy-body">{item.description}</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-sm"><div><dt className="text-xs text-navy-subtle">Baseline</dt><dd>{item.baseline || "—"}</dd></div><div><dt className="text-xs text-navy-subtle">Target</dt><dd>{item.target || "—"}</dd></div><div><dt className="text-xs text-navy-subtle">Delivered</dt><dd>{item.delivered || "Not reported"}</dd></div></dl>
    </article>)}</div>
    {!promises.length && <p className="rounded-2xl border border-navy-border bg-navy-card p-5 text-sm text-navy-body">No public commitments yet.</p>}
  </main>;
}
