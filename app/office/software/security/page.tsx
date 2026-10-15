import Link from "next/link";
import { requirePageCapability } from "@/lib/office-access";

const checks = [
  "No real student data or production credentials in this prototype.",
  "Secrets are configured through environment variables, never committed to source control.",
  "Every executive route checks its capability on the server.",
  "Technical account and role-change requests require President AND General Secretary approval.",
  "Anonymous concern senders must remain hidden in all output and logs.",
  "Uploads are restricted by file type and size and stored outside public paths.",
  "Production deployment needs individual executive identities, MFA, backups, monitoring, and a volunteer security review.",
];

export default async function SoftwareSecurityPage() {
  await requirePageCapability("software.board");
  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">Software director</p><h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Security checklist</h1>
      <p className="mt-1 text-sm text-navy-body">Prototype review reminders, not a certification or a substitute for a security review.</p></header>
    <ul className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5">{checks.map((check) => <li key={check} className="flex gap-3 text-sm text-navy-body"><span className="text-mint">□</span>{check}</li>)}</ul>
    <Link href="/office/software" className="text-sm text-mint underline">Back to platform board</Link>
  </section>;
}
