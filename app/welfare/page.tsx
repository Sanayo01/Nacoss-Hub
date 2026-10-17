import { WelfareCaseForm } from "@/components/StudentServiceForms";
import { listPublicWellbeingResources } from "@/lib/remaining-offices";

export const dynamic = "force-dynamic";

export default async function WelfarePage() {
  const { drives, resources } = await listPublicWellbeingResources();
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">Welfare support</p><h1 className="mt-1 text-3xl font-extrabold text-navy-heading">Wellbeing resources</h1><p className="mt-2 text-sm text-navy-body">Public resources are separate from the confidential executive case inbox.</p></header>
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-navy-border bg-navy-card p-5"><h2 className="font-bold text-navy-heading">Resources</h2><ul className="mt-3 space-y-2 text-sm text-navy-body">{resources.map((item) => <li key={item.id}>{item.link ? <a className="text-mint underline" href={item.link} rel="noreferrer">{item.title}</a> : item.title} · {item.description}</li>)}</ul></div>
      <div className="rounded-2xl border border-navy-border bg-navy-card p-5"><h2 className="font-bold text-navy-heading">Welfare drives</h2><ul className="mt-3 space-y-2 text-sm text-navy-body">{drives.map((item) => <li key={item.id}>{item.title} · {item.startsAt.toLocaleDateString()}–{item.endsAt.toLocaleDateString()}<p>{item.description}</p></li>)}</ul></div>
    </section>
    <WelfareCaseForm />
  </main>;
}
