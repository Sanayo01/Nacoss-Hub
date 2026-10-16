import { PublicEventsWorkspace } from "@/components/office/ThreeOfficeWorkspaces";
import { listPublicSocialEvents } from "@/lib/three-offices";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await listPublicSocialEvents();
  return <section className="mx-auto max-w-4xl space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-widest text-mint">NACOSS UNILAG</p><h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Events and volunteering</h1>
      <p className="mt-1 text-sm text-navy-body">Approved events appear here and on the student calendar. Volunteer hours are recorded only with your explicit opt-in.</p></header>
    <PublicEventsWorkspace initialEvents={events.map(({ id, title, description, venue, startsAt, endsAt, _count }) => ({
      id, title, description, venue, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(), _count,
    }))} />
  </section>;
}
