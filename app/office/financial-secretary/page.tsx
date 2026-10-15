import { requirePageCapability } from "@/lib/office-access";
import { listFinancialSecretaryWorkspace } from "@/lib/remaining-offices";
import { FinancialSecretaryWorkspace } from "@/components/office/RemainingOfficeWorkspaces";

export default async function FinancialSecretaryPage() {
  await requirePageCapability("finance.dues.view");
  const initialData = await listFinancialSecretaryWorkspace();
  return <section className="space-y-5">
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-mint">Financial Secretary</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Dues and queries</h1>
      <p className="mt-1 text-sm text-navy-body">Mock dues records, reminder drafts for PRO, monthly report, and financial queries.</p>
    </header>
    <FinancialSecretaryWorkspace initialData={initialData} />
  </section>;
}
