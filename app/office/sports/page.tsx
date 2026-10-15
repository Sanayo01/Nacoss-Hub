import { requirePageCapability } from "@/lib/office-access";
import { listSportsWorkspace } from "@/lib/remaining-offices";
import { SportsSecretaryWorkspace } from "@/components/office/RemainingOfficeWorkspaces";

export default async function SportsSecretaryPage() {
  await requirePageCapability("sports.manage");
  const initialData = await listSportsWorkspace();
  return <section className="space-y-5">
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-mint">Sports Secretary</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Teams and fixtures</h1>
      <p className="mt-1 text-sm text-navy-body">Manage teams, match results, training, equipment, signups, and achievements.</p>
      <a href="/sports" className="mt-3 inline-block text-sm text-mint underline">Public sports and sign-up page</a>
    </header>
    <SportsSecretaryWorkspace initialData={{
      ...initialData,
      fixtures: initialData.fixtures.map((item) => ({ ...item, startsAt: item.startsAt.toISOString() })),
      training: initialData.training.map((item) => ({ ...item, startsAt: item.startsAt.toISOString() })),
      achievements: initialData.achievements.map((item) => ({ ...item, achievedAt: item.achievedAt.toISOString() })),
    }} />
  </section>;
}
