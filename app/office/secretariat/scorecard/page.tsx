import { requirePageCapability } from "@/lib/office-access";
import { getScorecardPromises } from "@/lib/secretariat";
import { ScorecardPromiseEditor } from "@/components/office/SecretariatRecords";

export default async function PromiseScorecardPage() {
  await requirePageCapability("gensec.scorecard.manage");
  const promises = await getScorecardPromises();
  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">Secretariat oversight</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Promised vs delivered</h1>
      <p className="mt-1 text-sm text-navy-body">Edit commitments and delivery updates; published items appear in the public scorecard.</p></header>
    <ScorecardPromiseEditor initialPromises={promises} />
  </section>;
}
