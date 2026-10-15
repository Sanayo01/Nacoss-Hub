import { requirePageCapability } from "@/lib/office-access";
import { ExpenditureRequestForm } from "@/components/office/RemainingOfficeWorkspaces";

export default async function ExpenditureRequestPage() {
  await requirePageCapability("serious.submit");
  return <section className="mx-auto max-w-2xl space-y-5">
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-mint">Executive finance</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Expenditure request</h1>
    </header>
    <ExpenditureRequestForm />
  </section>;
}
