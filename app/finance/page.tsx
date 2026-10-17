import { FinanceQueryForm } from "@/components/StudentServiceForms";
import { getPublicFinanceSummary } from "@/lib/remaining-offices";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const summary = await getPublicFinanceSummary();
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">Public-safe record summary</p><h1 className="mt-1 text-3xl font-extrabold text-navy-heading">Financial transparency</h1><p className="mt-2 text-sm text-navy-body">Record-only totals; no payment integration, bank details, or individual student dues status is shown.</p></header>
    <section className="grid gap-3 md:grid-cols-3"><div className="rounded-xl border border-navy-border bg-navy-card p-4 text-navy-heading">Income recorded <strong className="block text-xl">₦{summary.income.toLocaleString()}</strong></div><div className="rounded-xl border border-navy-border bg-navy-card p-4 text-navy-heading">Expenditure recorded <strong className="block text-xl">₦{summary.expenditure.toLocaleString()}</strong></div><div className="rounded-xl border border-navy-border bg-navy-card p-4 text-navy-heading">Record balance <strong className="block text-xl">₦{summary.balance.toLocaleString()}</strong></div></section>
    <section className="rounded-2xl border border-navy-border bg-navy-card p-5"><h2 className="font-bold text-navy-heading">Office totals</h2><ul className="mt-3 space-y-2 text-sm text-navy-body">{summary.byOffice.map((item) => <li key={item.office}>{item.office}: ₦{item.income.toLocaleString()} income · ₦{item.expenditure.toLocaleString()} expenditure</li>)}</ul><h2 className="mt-5 font-bold text-navy-heading">Event totals</h2><ul className="mt-3 space-y-2 text-sm text-navy-body">{summary.events.map((item) => <li key={item.event}>{item.event}: ₦{item.income.toLocaleString()} income · ₦{item.expenditure.toLocaleString()} expenditure</li>)}</ul></section>
    <FinanceQueryForm />
  </main>;
}
