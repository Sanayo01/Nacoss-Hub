import { requirePageCapability } from "@/lib/office-access";
import { listSocialEvents } from "@/lib/three-offices";
import { SocialWorkspace } from "@/components/office/ThreeOfficeWorkspaces";

export default async function SocialSecretaryPage() {
  await requirePageCapability("social.events");
  const events = await listSocialEvents();
  return <section className="space-y-5">
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-mint">Social secretary</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Event planner</h1>
      <p className="mt-1 text-sm text-navy-body">Plan events, request budgets from the Treasurer, manage volunteers, and file event reports.</p>
      <a href="/events" className="mt-3 inline-block text-sm text-mint underline">Student event signup page</a>
    </header>
    <SocialWorkspace initialEvents={events.map((event) => ({
      ...event,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      volunteers: event.volunteers,
      feedback: event.feedback.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
    }))} />
  </section>;
}
