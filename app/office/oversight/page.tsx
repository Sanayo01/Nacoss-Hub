import { requirePageCapability, hasEffectiveCapability } from "@/lib/office-access";
import { listOversightQueries } from "@/lib/secretariat";
import { OversightWorkspace } from "@/components/office/SecretariatRecords";

export default async function OversightPage() {
  const office = await requirePageCapability("oversight.respond");
  const [queries, canCreate] = await Promise.all([
    listOversightQueries(office),
    hasEffectiveCapability(office, "gensec.oversight.manage"),
  ]);
  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">Executive accountability</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Oversight register</h1>
      <p className="mt-1 text-sm text-navy-body">Formal queries and reminders are recorded and answerable. They record and flag matters; they do not overrule decisions.</p></header>
    <OversightWorkspace initialQueries={queries.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      responseAt: item.responseAt?.toISOString() ?? null,
    }))} office={office} canCreate={canCreate} />
  </section>;
}
