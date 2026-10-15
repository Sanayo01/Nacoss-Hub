import Link from "next/link";
import { requirePageCapability } from "@/lib/office-access";
import { getCommittees, getCoordinationBoard } from "@/lib/power-office-data";
import { getOfficeMeetings } from "@/lib/office-data";
import { db } from "@/lib/db";
import { VicePresidentWorkspace } from "@/components/office/PowerOfficeWorkspaces";

export default async function VicePresidentPage() {
  const office = await requirePageCapability("vp.coordinate");
  const [committees, board, meetings, delegation] = await Promise.all([
    getCommittees(), getCoordinationBoard(), getOfficeMeetings(office),
    db.delegation.findFirst({
      where: {
        grantingOffice: "president", delegateOffice: "vice-president", status: "ACTIVE",
        startsAt: { lte: new Date() }, endsAt: { gt: new Date() },
      },
      orderBy: { startsAt: "desc" },
    }),
  ]);
  return <section className="space-y-5">
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-mint">Vice-presidential office</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Coordination</h1>
      {delegation && <p className="mt-2 inline-flex rounded-full bg-mint/10 px-3 py-1 text-xs font-bold text-mint">Acting President · delegation ends {delegation.endsAt.toLocaleString()}</p>}
      <div className="mt-3 flex gap-3 text-sm"><Link className="text-mint underline" href="/office/scorecard">Read scorecard</Link><Link className="text-mint underline" href="/office/tasks">Task board</Link></div>
    </header>
    <VicePresidentWorkspace
      committees={committees.map((committee) => ({ ...committee, members: committee.members.map((member) => ({ office: member.office })) }))}
      board={board.map((item) => ({
        ...item,
        tasks: item.tasks.map((task) => ({ ...task, dueDate: task.dueDate?.toISOString() ?? null })),
        meetings: item.meetings.map((meeting) => ({ ...meeting, date: meeting.date.toISOString() })),
      }))}
      meetings={meetings.map(({ id, title, date }) => ({ id, title, date: date.toISOString() }))}
    />
  </section>;
}
