import { requirePageCapability } from "@/lib/office-access";
import { verifyChain } from "@/lib/audit";
import { db } from "@/lib/db";

export default async function AuditPage() {
  await requirePageCapability("audit.view");
  const [verification, entries] = await Promise.all([
    verifyChain(),
    db.auditLog.findMany({ orderBy: { sequence: "desc" }, take: 100 }),
  ]);
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-mint">Integrity monitoring</p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Audit chain</h1>
      </header>
      <div role="status" className={`rounded-2xl border p-5 font-bold ${verification.intact ? "border-mint/40 bg-mint/10 text-mint" : "border-red-400/50 bg-red-500/10 text-red-300"}`}>
        {verification.intact ? "chain intact" : `tampering detected at row ${verification.brokenAt}`}
        <p className="mt-1 text-xs font-normal opacity-80">{verification.rowsChecked} rows verified.</p>
      </div>
      <div className="space-y-2">
        {entries.map((entry) => {
          const payload = JSON.parse(entry.payload) as { action?: string; office?: string; entityType?: string; entityId?: string; occurredAt?: string };
          return (
            <article key={entry.sequence} className="rounded-xl border border-navy-border bg-navy-card p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <strong className="text-sm text-navy-heading">{payload.action ?? "Recorded event"}</strong>
                <span className="text-xs text-navy-subtle">{payload.occurredAt ? new Date(payload.occurredAt).toLocaleString() : entry.createdAt.toLocaleString()}</span>
              </div>
              <p className="mt-1 text-xs text-navy-body">{payload.office} · {payload.entityType}{payload.entityId ? ` · ${payload.entityId}` : ""}</p>
              <p className="mt-2 break-all font-mono text-[10px] text-navy-subtle">Hash: {entry.hash}</p>
            </article>
          );
        })}
        {!entries.length && <p className="text-sm text-navy-body">The audit chain is empty. Its first entry will anchor to the genesis hash.</p>}
      </div>
    </section>
  );
}
