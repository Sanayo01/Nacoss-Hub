import { requirePageCapability } from "@/lib/office-access";
import { getOfficeNotifications } from "@/lib/office-data";
import NotificationsWorkspace from "@/components/office/NotificationsWorkspace";

export default async function NotificationsPage() {
  const office = await requirePageCapability("notifications.view");
  const items = await getOfficeNotifications(office);
  const unread = items.filter((item) => !item.readAt).length;
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-mint">Office updates</p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy-heading">Notifications</h1>
        <p className="mt-1 text-sm text-navy-body">{unread} unread · Meeting and approval updates are also sent through the configured mailer.</p>
      </header>
      <NotificationsWorkspace initialItems={items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), readAt: item.readAt?.toISOString() ?? null }))} />
    </section>
  );
}
