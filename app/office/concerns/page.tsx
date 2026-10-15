import { can } from "@/config/permissions";
import { requirePageCapability } from "@/lib/office-access";
import { getAdminConcerns } from "@/lib/db";
import ConcernsWorkspace from "@/components/office/ConcernsWorkspace";

export default async function ConcernsPage() {
  const office = await requirePageCapability("concerns.view");
  const concerns = await getAdminConcerns({ office, status: "all" });
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-mint">Student communications</p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Concern inbox</h1>
        <p className="mt-1 text-sm text-navy-body">Only concerns routed to your office appear here. Anonymous sender identity is withheld.</p>
      </header>
      <ConcernsWorkspace
        initialConcerns={concerns.map((concern) => ({ ...concern, createdAt: concern.createdAt.toISOString() }))}
        canManage={can(office, "concerns.manage")}
      />
    </section>
  );
}
