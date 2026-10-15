import { requirePageCapability } from "@/lib/office-access";
import { listTreasurerWorkspace } from "@/lib/remaining-offices";
import { TreasurerWorkspace } from "@/components/office/RemainingOfficeWorkspaces";

export default async function TreasurerPage() {
  await requirePageCapability("treasury.ledger.view");
  const data = await listTreasurerWorkspace();
  return <section className="space-y-5">
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-mint">Treasurer</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Funds and budgets</h1>
      <p className="mt-1 text-sm text-navy-body">Record-only ledger, event and office budgets, expenditure approvals, and term statement.</p>
    </header>
    <TreasurerWorkspace initialData={data} />
  </section>;
}
