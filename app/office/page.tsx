import Link from "next/link";
import { requirePageCapability } from "@/lib/office-access";
import { getOfficeDay } from "@/lib/office-data";
import { getActingOffice } from "@/lib/office-access";

function Card({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-navy-border bg-navy-card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-bold text-navy-heading">{title}</h2>
        <Link href={href} className="text-xs font-semibold text-mint hover:underline">View all</Link>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-navy-subtle">{children}</p>;
}

export default async function OfficeDayPage() {
  const office = await requirePageCapability("office.access");
  const data = await getOfficeDay(office, await getActingOffice(office));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-mint">Executive workspace</p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">My Day</h1>
        <p className="mt-1 text-sm text-navy-body">Your meetings, tasks, approvals, concerns, and latest updates.</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Next meetings" href="/office/meetings">
          {data.meetings.length ? <ul className="space-y-3">{data.meetings.map((meeting) => (
            <li key={meeting.id} className="border-b border-navy-border pb-3 last:border-0">
              <div className="font-semibold text-navy-heading">{meeting.title}</div>
              <div className="mt-1 text-xs text-navy-body">{meeting.date.toLocaleString()} · {meeting.venue}</div>
            </li>
          ))}</ul> : <Empty>No upcoming meetings.</Empty>}
        </Card>

        <Card title="My tasks" href="/office/tasks">
          {data.tasks.length ? <ul className="space-y-3">{data.tasks.slice(0, 5).map((task) => (
            <li key={task.id} className="flex items-start justify-between gap-3">
              <span className="text-sm text-navy-heading">{task.title}</span>
              {task.overdue && <span className="text-xs font-bold text-red-400">OVERDUE</span>}
            </li>
          ))}</ul> : <Empty>No open tasks.</Empty>}
        </Card>

        <Card title="Pending approvals" href="/office/approvals">
          {data.approvals.length ? <ul className="space-y-2">{data.approvals.slice(0, 5).map((approval) => (
            <li key={approval.id} className="text-sm text-navy-heading">{approval.type.replaceAll("_", " ")} <span className="text-xs text-navy-subtle">from {approval.makerOffice}</span></li>
          ))}</ul> : <Empty>No approvals awaiting your decision.</Empty>}
        </Card>

        <Card title="Concern inbox" href="/office/concerns">
          {data.concerns.length ? <ul className="space-y-2">{data.concerns.slice(0, 5).map((concern) => (
            <li key={concern.id} className="text-sm text-navy-heading">{concern.subject} <span className="text-xs text-navy-subtle">· {concern.status.replaceAll("_", " ")}</span></li>
          ))}</ul> : <Empty>No active concerns assigned to your office.</Empty>}
        </Card>
      </div>

      <Card title="Latest notifications" href="/office/notifications">
        {data.notifications.length ? <ul className="space-y-2">{data.notifications.map((notification) => (
          <li key={notification.id} className="text-sm text-navy-heading">{notification.title}<span className="ml-2 text-xs text-navy-body">{notification.message}</span></li>
        ))}</ul> : <Empty>You’re all caught up.</Empty>}
      </Card>
    </div>
  );
}
