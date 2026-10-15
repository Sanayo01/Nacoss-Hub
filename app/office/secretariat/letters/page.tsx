import { requirePageCapability, getActingOffice } from "@/lib/office-access";
import { listOfficialLetters } from "@/lib/secretariat";
import { OfficialLettersWorkspace } from "@/components/office/SecretariatRecords";

export default async function OfficialLettersPage() {
  const office = await requirePageCapability("ags.letters.draft");
  const letters = await listOfficialLetters(office, await getActingOffice(office));
  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">Secretariat records</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Official letters</h1>
      <p className="mt-1 text-sm text-navy-body">Unique NACOS/GS/YYYY/NNN references. Drafts created by the AGS require a General Secretary approval before they are issued.</p></header>
    <OfficialLettersWorkspace initialLetters={letters.map((letter) => ({ ...letter, createdAt: letter.createdAt.toISOString() }))} office={office} />
  </section>;
}
