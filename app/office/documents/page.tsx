import { requirePageCapability } from "@/lib/office-access";
import { getDocuments } from "@/lib/db";
import { listOfficeDocuments } from "@/lib/secretariat";
import { can } from "@/config/permissions";
import { OfficeDocumentVault } from "@/components/office/SecretariatRecords";
import { getActingOffice } from "@/lib/office-access";

export default async function OfficeDocumentsPage() {
  const office = await requirePageCapability("documents.view");
  const [documents, vaultDocuments] = await Promise.all([
    getDocuments(),
    listOfficeDocuments(office, await getActingOffice(office)),
  ]);
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-mint">Reference library</p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Documents</h1>
        <p className="mt-1 text-sm text-navy-body">Shared executive and departmental reference documents.</p>
      </header>
      <h2 className="text-lg font-bold text-navy-heading">Office vault</h2>
      <OfficeDocumentVault
        canFile={can(office, "ags.documents.file")}
        initialDocuments={vaultDocuments.map((item) => ({
          ...item,
          versions: item.versions.map((version) => ({ ...version, createdAt: version.createdAt.toISOString() })),
        }))}
      />
      <h2 className="text-lg font-bold text-navy-heading">Reference library</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {documents.map((document) => (
          <a key={document.id} href={document.fileUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-navy-border bg-navy-card p-5 hover:border-mint">
            <span className="text-[10px] font-bold uppercase tracking-widest text-mint">{document.category}</span>
            <h2 className="mt-2 font-bold text-navy-heading">{document.title}</h2>
            <p className="mt-2 text-sm text-navy-body">{document.description}</p>
          </a>
        ))}
        {!documents.length && <p className="text-sm text-navy-body">No documents are available.</p>}
      </div>
    </section>
  );
}
