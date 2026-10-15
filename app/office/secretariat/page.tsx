import Link from "next/link";
import { requirePageCapability } from "@/lib/office-access";
import { getMinutesWorkspace } from "@/lib/minutes-workflow";
import { GeneralSecretaryDelegation, MinutesStudio } from "@/components/office/PowerOfficeWorkspaces";
import { getDelegations } from "@/lib/power-office-data";

export default async function SecretariatPage() {
  const office = await requirePageCapability("ags.minutes.draft");
  const [meetings, delegations] = await Promise.all([
    getMinutesWorkspace(),
    getDelegations("general-secretary"),
  ]);
  const activeCover = office === "assistant-general-secretary" && delegations.some((item) =>
    item.status === "ACTIVE" && item.startsAt <= new Date() && item.endsAt > new Date()
  );
  return <section className="space-y-5">
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-mint">Secretariat</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Minutes studio</h1>
      {activeCover && <p className="mt-2 inline-flex rounded-full bg-mint/10 px-3 py-1 text-xs font-bold text-mint">Acting General Secretary</p>}
      <p className="mt-1 text-sm text-navy-body">{office === "general-secretary" ? "Draft, review, and approve records. Approved minutes are locked and create action tasks and a shareable decision digest." : "Draft and submit minutes to the General Secretary for one-tap approval."}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-sm"><Link className="text-mint underline" href="/office/approvals">Approval queue</Link><Link className="text-mint underline" href="/office/secretariat/letters">Official letters</Link><Link className="text-mint underline" href="/office/secretariat/concerns">Concern command</Link><Link className="text-mint underline" href="/office/secretariat/scorecard">Promised vs delivered</Link><Link className="text-mint underline" href="/office/oversight">Oversight register</Link><Link className="text-mint underline" href="/office/secretariat/handover">Handover pack</Link><Link className="text-mint underline" href="/office/secretariat/directory">Executive directory</Link><Link className="text-mint underline" href="/decisions">Published Decision Digests</Link><Link className="text-mint underline" href="/office/documents">Document vault</Link></div>
    </header>
    <MinutesStudio meetings={meetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      date: meeting.date.toISOString(),
      status: meeting.minutes?.status ?? null,
      attendance: meeting.minutes ? JSON.parse(meeting.minutes.attendance) as string[] : [],
      agendaItems: meeting.minutes ? JSON.parse(meeting.minutes.agendaItems) as Array<{ decision: string; why: string; ownerOffice: string; deadline: string; shareable: boolean }> : null,
    }))} />
    {office === "general-secretary" && <GeneralSecretaryDelegation delegations={delegations.map((item) => ({
      id: item.id, startsAt: item.startsAt.toISOString(), endsAt: item.endsAt.toISOString(),
      status: item.status, delegateOffice: item.delegateOffice,
    }))} />}
  </section>;
}
