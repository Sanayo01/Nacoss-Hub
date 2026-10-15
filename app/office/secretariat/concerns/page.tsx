import { requirePageCapability } from "@/lib/office-access";
import { getSecretariatConcerns } from "@/lib/secretariat";
import { ConcernCommand } from "@/components/office/SecretariatRecords";

export default async function SecretariatConcernsPage() {
  await requirePageCapability("gensec.concerns.manage");
  const concerns = await getSecretariatConcerns();
  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">Secretariat command</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Concern command</h1>
      <p className="mt-1 text-sm text-navy-body">All office concerns, stale alerts, reassignment and escalation. Anonymous sender identity is never included in this data.</p></header>
    <ConcernCommand initialConcerns={concerns.map((item) => ({
      ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString(),
    }))} />
  </section>;
}
