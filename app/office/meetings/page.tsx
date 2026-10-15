import { requirePageCapability, hasEffectiveCapability } from "@/lib/office-access";
import { getOfficeMeetings } from "@/lib/office-data";
import MeetingsWorkspace from "@/components/office/MeetingsWorkspace";

export default async function MeetingsPage() {
  const office = await requirePageCapability("meetings.view");
  const [meetings, canCreate] = await Promise.all([
    getOfficeMeetings(office),
    hasEffectiveCapability(office, "meetings.create"),
  ]);
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-mint">Executive coordination</p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Meetings</h1>
        <p className="mt-1 text-sm text-navy-body">Meetings are visible on every office dashboard. Agenda reminders are scheduled for 48 hours before each meeting.</p>
      </header>
      <MeetingsWorkspace initialMeetings={meetings.map((meeting) => ({
        ...meeting,
        date: meeting.date.toISOString(),
      }))} canCreate={canCreate} />
    </section>
  );
}
