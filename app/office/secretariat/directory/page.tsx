import { requirePageCapability } from "@/lib/office-access";
import { getExecutiveDirectory } from "@/lib/secretariat";
import { ExecutiveDirectoryWorkspace } from "@/components/office/SecretariatRecords";

export default async function ExecutiveDirectoryPage() {
  await requirePageCapability("gensec.directory.manage");
  const entries = await getExecutiveDirectory();
  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">Secretariat records</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Executive directory</h1>
      <p className="mt-1 text-sm text-navy-body">Update listing consent, office contacts and local photo paths. The prototype only accepts placeholders and approved test addresses.</p></header>
    <ExecutiveDirectoryWorkspace initialEntries={entries} />
  </section>;
}
