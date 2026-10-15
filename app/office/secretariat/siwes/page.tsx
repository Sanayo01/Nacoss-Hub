import { requirePageCapability } from "@/lib/office-access";
import { getSiwesModerationQueue } from "@/lib/secretariat";
import { SiwesModerationQueue } from "@/components/office/SecretariatRecords";

export default async function SiwesModerationPage() {
  await requirePageCapability("ags.siwes.process");
  const queue = await getSiwesModerationQueue();
  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">Secretariat queue</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">SIWES and alumni moderation</h1>
      <p className="mt-1 text-sm text-navy-body">Consent status is visible; approvals, rejections and removals require approval and are audited.</p></header>
    <SiwesModerationQueue placements={queue.placements} alumni={queue.alumni} removals={queue.removals} />
  </section>;
}
