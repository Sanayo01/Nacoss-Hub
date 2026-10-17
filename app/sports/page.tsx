import { SportsSignupForm } from "@/components/StudentServiceForms";
import { listPublicSportsSummary } from "@/lib/remaining-offices";

export const dynamic = "force-dynamic";

export default async function SportsPage() {
  const data = await listPublicSportsSummary();
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">NACOSS sports</p><h1 className="mt-1 text-3xl font-extrabold text-navy-heading">Training, fixtures and achievements</h1></header>
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-2xl border border-navy-border bg-navy-card p-5"><h2 className="font-bold text-navy-heading">Fixtures</h2><ul className="mt-3 space-y-2 text-sm text-navy-body">{data.fixtures.map((item) => <li key={item.id}>{item.team} vs {item.opponent} · {item.venue} · {item.startsAt.toLocaleString()} · {item.result || "Upcoming"}</li>)}</ul></section>
      <section className="rounded-2xl border border-navy-border bg-navy-card p-5"><h2 className="font-bold text-navy-heading">Training</h2><ul className="mt-3 space-y-2 text-sm text-navy-body">{data.training.map((item) => <li key={item.id}>{item.team} · {item.venue} · {item.startsAt.toLocaleString()}</li>)}</ul></section>
      <section className="rounded-2xl border border-navy-border bg-navy-card p-5 md:col-span-2"><h2 className="font-bold text-navy-heading">Achievements wall</h2><ul className="mt-3 space-y-2 text-sm text-navy-body">{data.achievements.map((item) => <li key={item.id}>{item.title} · {item.details}</li>)}</ul></section>
    </div>
    <SportsSignupForm />
  </main>;
}
