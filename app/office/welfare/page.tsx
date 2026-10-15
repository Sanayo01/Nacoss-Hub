import { requirePageCapability } from "@/lib/office-access";
import { listWelfareWorkspace } from "@/lib/remaining-offices";
import { WelfareSecretaryWorkspace } from "@/components/office/RemainingOfficeWorkspaces";

export default async function WelfareSecretaryPage() {
  await requirePageCapability("welfare.cases.view");
  const initialData = await listWelfareWorkspace();
  return <section className="space-y-5">
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-mint">Welfare Secretary · confidential</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Welfare and referrals</h1>
      <p className="mt-1 text-sm text-navy-body">Private case inbox, referrals, welfare drives, and wellbeing resources. Access is restricted to the Welfare Secretary and President.</p>
      <a href="/welfare" className="mt-3 inline-block text-sm text-mint underline">Public wellbeing resources and confidential case form</a>
    </header>
    <WelfareSecretaryWorkspace initialData={{
      ...initialData,
      drives: initialData.drives.map((item) => ({ ...item, startsAt: item.startsAt.toISOString(), endsAt: item.endsAt.toISOString() })),
    }} />
  </section>;
}
