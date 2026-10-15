import { requirePageCapability, hasEffectiveCapability, getActingOffice } from "@/lib/office-access";
import { listApprovalRequests } from "@/lib/approvals";
import ApprovalsWorkspace from "@/components/office/ApprovalsWorkspace";

export default async function ApprovalsPage() {
  const office = await requirePageCapability("approvals.view");
  const actingFor = await getActingOffice(office);
  const [requests, canDecide] = await Promise.all([
    listApprovalRequests(office, actingFor),
    hasEffectiveCapability(office, "approvals.decide"),
    getActingOffice(office),
  ]);
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-mint">Decision queue</p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Approvals</h1>
        <p className="mt-1 text-sm text-navy-body">Requests expire after 72 hours by default. Two-key actions require approval from both named offices.</p>
      </header>
      <ApprovalsWorkspace
        initialRequests={requests.map((request) => ({ ...request, expiresAt: request.expiresAt.toISOString() }))}
        canDecide={canDecide}
        office={office}
      />
    </section>
  );
}
