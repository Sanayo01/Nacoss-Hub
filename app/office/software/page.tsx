import Link from "next/link";
import { requirePageCapability } from "@/lib/office-access";
import { listSoftwareBoard } from "@/lib/three-offices";
import { SoftwareWorkspace } from "@/components/office/ThreeOfficeWorkspaces";

export default async function SoftwareDirectorPage() {
  await requirePageCapability("software.board");
  const data = await listSoftwareBoard();
  return <section className="space-y-5">
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-mint">Software director</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Platform board</h1>
      <p className="mt-1 text-sm text-navy-body">Triage platform feedback, coordinate volunteers, and record releases. Prototype-only data.</p>
      <div className="mt-3 flex gap-4 text-sm">
        <Link className="text-mint underline" href="/office/software/security">Security checklist</Link>
        <Link className="text-mint underline" href="/office/software/status">System status</Link>
      </div>
    </header>
    <SoftwareWorkspace data={data} />
  </section>;
}
