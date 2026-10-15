import Link from "next/link";
import { requirePageCapability } from "@/lib/office-access";
import { getExecutiveScorecard, getDelegations } from "@/lib/power-office-data";
import { getMotions } from "@/lib/motions";
import { getOfficeMeetings } from "@/lib/office-data";
import { db } from "@/lib/db";
import { PresidentWorkspace } from "@/components/office/PowerOfficeWorkspaces";
import { can } from "@/config/permissions";

export default async function PresidentPage() {
  const office = await requirePageCapability("president.manage");
  const [scorecard, delegations, motions, meetings, delegation, pendingApprovals] = await Promise.all([
    getExecutiveScorecard(),
    getDelegations("president"),
    getMotions(),
    getOfficeMeetings(office),
    db.delegation.findFirst({
      where: {
        grantingOffice: "president", delegateOffice: "vice-president", status: "ACTIVE",
        startsAt: { lte: new Date() }, endsAt: { gt: new Date() },
      },
      orderBy: { startsAt: "desc" },
    }),
    db.approvalRequest.findMany({
      where: { status: "PENDING", expiresAt: { gt: new Date() } },
      include: { decisions: true },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
  ]);
  return <section className="space-y-5">
    <header>
      <p className="text-xs font-bold uppercase tracking-widest text-mint">Presidential office</p>
      <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Executive command</h1>
      {delegation && <p className="mt-2 inline-flex rounded-full bg-mint/10 px-3 py-1 text-xs font-bold text-mint">Acting President: Vice President until {delegation.endsAt.toLocaleString()}</p>}
      <div className="mt-3 flex flex-wrap gap-3 text-sm"><Link className="text-mint underline" href="/office/meetings">Meeting scheduler</Link><Link className="text-mint underline" href="/office/tasks">Task assignment and overdue board</Link><Link className="text-mint underline" href="/office/approvals">Approval centre</Link><Link className="text-mint underline" href="/office/concerns">Escalation inbox</Link></div>
    </header>
    <PresidentWorkspace
      scorecard={scorecard}
      office={office}
      canDelegate={can(office, "president.delegate")}
      delegations={delegations.map((item) => ({ ...item, startsAt: item.startsAt.toISOString(), endsAt: item.endsAt.toISOString() }))}
      meetings={meetings.map(({ id, title, date, rsvps }) => ({
        id, title, date: date.toISOString(),
        rsvps: rsvps.map(({ office: rsvpOffice, response }) => ({ office: rsvpOffice, response })),
      }))}
      motions={motions.map(({ id, meetingId, title, description, quorumPercent, status, result, votes }) => ({
        id, meetingId, title, description, quorumPercent, status, result,
        votes: votes.map(({ office: voteOffice, vote }) => ({ office: voteOffice, vote })),
      }))}
      pendingApprovals={pendingApprovals.map((item) => ({
        id: item.id,
        type: item.type,
        makerOffice: item.makerOffice,
        payload: item.payload,
        canDecide: (JSON.parse(item.requiredApprovers) as string[]).includes(
          office === "vice-president" && delegation ? "president" : office
        ) && !item.decisions.some((decision) =>
          decision.office === office ||
          decision.office === (office === "vice-president" && delegation ? "president" : office) ||
          decision.actingFor === (office === "vice-president" && delegation ? "president" : office)
        ),
      }))}
    />
  </section>;
}
