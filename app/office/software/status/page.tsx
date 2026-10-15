import Link from "next/link";
import { requirePageCapability } from "@/lib/office-access";
import { checkOfficeDatabase } from "@/lib/three-offices";

export const dynamic = "force-dynamic";

export default async function SoftwareStatusPage() {
  await requirePageCapability("software.board");
  let database = "Unavailable";
  try {
    await checkOfficeDatabase();
    database = "Operational";
  } catch (error) {
    console.error("Software system-status database probe failed:", error);
  }
  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">Software director</p><h1 className="mt-1 text-2xl font-extrabold text-navy-heading">System status</h1></header>
    <div className="grid gap-3 sm:grid-cols-2">
      {[["Application", "Operational"], ["Database", database], ["Runtime", process.env.NODE_ENV], ["Mode", "Prototype / mock data"]].map(([name, status]) =>
        <article key={name} className="rounded-2xl border border-navy-border bg-navy-card p-5"><p className="text-xs uppercase text-navy-subtle">{name}</p><p className={`mt-2 font-bold ${status === "Unavailable" ? "text-red-400" : "text-mint"}`}>{status}</p></article>
      )}
    </div>
    <p className="text-xs text-navy-subtle">This page checks the local application and database only; it does not monitor external infrastructure.</p>
    <Link href="/office/software" className="text-sm text-mint underline">Back to platform board</Link>
  </section>;
}
