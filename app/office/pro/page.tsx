import { requirePageCapability } from "@/lib/office-access";
import { listProStudio } from "@/lib/three-offices";
import { ProWorkspace } from "@/components/office/ThreeOfficeWorkspaces";
import { listProDuesReminderDrafts } from "@/lib/remaining-offices";

export default async function PROPage() {
  await requirePageCapability("pro.studio");
  const data = await listProStudio();
  const duesReminders = await listProDuesReminderDrafts();
  return <section className="space-y-5">
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-mint">Public relations office</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Announcement studio</h1>
      <p className="mt-1 text-sm text-navy-body">Draft, preview, request approvals, coordinate coverage, and manage approved media assets.</p>
    </header>
    <ProWorkspace data={{
      ...data,
      calendar: data.calendar.map((item) => ({ ...item, scheduledAt: item.scheduledAt.toISOString() })),
      coverage: data.coverage.map((task) => ({ ...task, dueDate: task.dueDate?.toISOString() ?? null })),
    }} />
    <section className="space-y-3 rounded-2xl border border-navy-border bg-navy-card p-5">
      <h2 className="font-bold text-navy-heading">Dues reminders from Financial Secretary</h2>
      {duesReminders.length ? <ul className="space-y-3 text-sm text-navy-body">{duesReminders.map((item) => <li key={item.id}><strong>{item.title}</strong><p>{item.body}</p></li>)}</ul> : <p className="text-sm text-navy-subtle">No reminder drafts have been handed over.</p>}
      <p className="text-xs text-navy-subtle">These are draft copy only. PRO reviews and chooses whether to publish; no reminder is auto-sent.</p>
    </section>
  </section>;
}
