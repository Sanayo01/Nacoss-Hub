import Link from "next/link";
import { Bell, CalendarDays, CheckSquare, ClipboardList, FileText, Home, Inbox, BarChart3, ScrollText, BriefcaseBusiness } from "lucide-react";
import { EXECUTIVES_LIST } from "@/config/executives";
import { requirePageCapability } from "@/lib/office-access";
import OfficeControls from "@/components/office/OfficeControls";
import { getOfficeNotifications } from "@/lib/office-data";
import { hasEffectiveCapability } from "@/lib/office-access";

const sections = [
  { label: "My Day", href: "/office", icon: Home },
  { label: "Meetings", href: "/office/meetings", icon: CalendarDays },
  { label: "Tasks", href: "/office/tasks", icon: CheckSquare },
  { label: "Approvals", href: "/office/approvals", icon: ClipboardList },
  { label: "Concerns", href: "/office/concerns", icon: Inbox },
  { label: "Documents", href: "/office/documents", icon: FileText },
  { label: "Reports", href: "/office/reports", icon: BarChart3 },
  { label: "Notifications", href: "/office/notifications", icon: Bell },
  { label: "Audit", href: "/office/audit", icon: ScrollText, capability: "audit.view" as const },
  { label: "President", href: "/office/president", icon: BriefcaseBusiness, capability: "president.manage" as const },
  { label: "Vice President", href: "/office/vice-president", icon: BriefcaseBusiness, capability: "vp.coordinate" as const },
  { label: "Scorecard", href: "/office/scorecard", icon: BarChart3, capability: "president.scorecard" as const },
  { label: "Secretariat", href: "/office/secretariat", icon: BriefcaseBusiness, capability: "ags.minutes.draft" as const },
  { label: "Oversight", href: "/office/oversight", icon: ClipboardList, capability: "oversight.respond" as const },
  { label: "Concern command", href: "/office/secretariat/concerns", icon: Inbox, capability: "gensec.concerns.manage" as const },
  { label: "Promise scorecard", href: "/office/secretariat/scorecard", icon: BarChart3, capability: "gensec.scorecard.manage" as const },
  { label: "SIWES & alumni", href: "/office/secretariat/siwes", icon: FileText, capability: "ags.siwes.process" as const },
  { label: "Handover pack", href: "/office/secretariat/handover", icon: FileText, capability: "gensec.documents.manage" as const },
  { label: "Executive directory", href: "/office/secretariat/directory", icon: FileText, capability: "gensec.directory.manage" as const },
  { label: "PRO Studio", href: "/office/pro", icon: BriefcaseBusiness, capability: "pro.studio" as const },
  { label: "Software Director", href: "/office/software", icon: BriefcaseBusiness, capability: "software.board" as const },
  { label: "Social Secretary", href: "/office/social", icon: CalendarDays, capability: "social.events" as const },
  { label: "Financial Secretary", href: "/office/financial-secretary", icon: BriefcaseBusiness, capability: "finance.dues.view" as const },
  { label: "Treasurer", href: "/office/treasurer", icon: BriefcaseBusiness, capability: "treasury.ledger.view" as const },
  { label: "Expenditure request", href: "/office/expenditure", icon: BriefcaseBusiness, capability: "serious.submit" as const },
  { label: "Sports Secretary", href: "/office/sports", icon: CalendarDays, capability: "sports.manage" as const },
  { label: "Welfare Secretary", href: "/office/welfare", icon: Inbox, capability: "welfare.cases.view" as const },
];

export default async function OfficeLayout({ children }: { children: React.ReactNode }) {
  const office = await requirePageCapability("office.access");
  const executive = EXECUTIVES_LIST.find((item) => item.officeSlug === office);
  const unreadCount = (await getOfficeNotifications(office)).filter((item) => !item.readAt).length;
  const links = (await Promise.all(sections.map(async (section) => {
    if (!("capability" in section) || !section.capability) return section;
    return await hasEffectiveCapability(office, section.capability) ? section : null;
  }))).filter((section): section is NonNullable<typeof section> => section !== null);

  return (
    <div className="mx-auto min-h-[80vh] w-full max-w-7xl pb-24 lg:flex lg:gap-6 lg:pb-8">
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-5 space-y-5">
          <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3 text-center text-xs font-extrabold tracking-widest text-amber-300">
            DEMO MODE
          </div>
          <div className="rounded-2xl border border-navy-border bg-navy-card p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-navy-subtle">Active office</div>
            <div className="mt-1 font-bold text-navy-heading">{executive?.position}</div>
            <OfficeControls />
          </div>
          <nav className="space-y-1 rounded-2xl border border-navy-border bg-navy-card p-2" aria-label="Office navigation">
            {links.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className="flex min-h-touch items-center gap-3 rounded-xl px-3 text-sm text-navy-body hover:bg-navy-cardHover hover:text-mint">
                <Icon size={17} /> {label}
                {label === "Notifications" && unreadCount > 0 && <span className="ml-auto rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-navy-bgStart">{unreadCount}</span>}
              </Link>
            ))}
          </nav>
          <Link href="/admin" className="block px-3 text-xs text-navy-subtle hover:text-mint">Switch office</Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 space-y-5">
        <div className="flex items-center justify-between rounded-2xl border border-navy-border bg-navy-card px-4 py-3 lg:hidden">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-amber-300">DEMO MODE</div>
            <div className="text-sm font-bold text-navy-heading">{executive?.position}</div>
          </div>
          <OfficeControls compact />
        </div>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-navy-border bg-navy-bgStart/95 px-1 py-2 backdrop-blur lg:hidden" aria-label="Mobile office navigation">
        {links.filter((link) => link.href !== "/office/audit").map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className="flex min-h-touch min-w-[76px] shrink-0 flex-col items-center justify-center gap-1 text-[10px] text-navy-body hover:text-mint">
            <Icon size={18} /><span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
