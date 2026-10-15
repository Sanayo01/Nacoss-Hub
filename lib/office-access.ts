import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { CapabilityError, requireCapability } from "@/config/permissions";
import type { Capability } from "@/config/permissions";
import { getAdminSession, type OfficeSlug } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { can, ROLE_CAPABILITIES } from "@/config/permissions";
import { updateDelegationStatuses } from "@/lib/power-office-data";

export type OfficeGate = { office: OfficeSlug; actingFor?: OfficeSlug } | { response: NextResponse };

async function activeDelegationFor(office: OfficeSlug) {
  await updateDelegationStatuses();
  const now = new Date();
  return db.delegation.findFirst({
    where: {
      delegateOffice: office,
      status: "ACTIVE",
      startsAt: { lte: now },
      endsAt: { gt: now },
    },
    orderBy: { startsAt: "desc" },
  });
}

export async function getActingOffice(office: OfficeSlug): Promise<OfficeSlug | undefined> {
  const delegation = await activeDelegationFor(office);
  return delegation?.grantingOffice === "president" || delegation?.grantingOffice === "general-secretary"
    ? delegation.grantingOffice
    : undefined;
}

export async function hasEffectiveCapability(office: OfficeSlug, capability: Capability): Promise<boolean> {
  if (can(office, capability)) return true;
  const delegation = await activeDelegationFor(office);
  if (!delegation) return false;
  if (delegation.grantingOffice === "president") {
    return ROLE_CAPABILITIES.president.includes(capability) &&
      capability !== "admin.legacy" && capability !== "president.delegate";
  }
  return (capability.startsWith("gensec.") && capability !== "gensec.delegate") || capability === "approvals.decide" ||
    capability === "tasks.assign" || capability === "meetings.create" ||
    capability === "concerns.manage" || capability === "announcements.publish" ||
    capability === "documents.view" || capability === "reports.view" ||
    capability === "tasks.view" || capability === "tasks.update" ||
    capability === "meetings.view" || capability === "notifications.view";
}

export async function gateOfficeCapability(capability: Capability): Promise<OfficeGate> {
  const session = await getAdminSession();
  if (!session) {
    return { response: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }
  if (!session.office) {
    return { response: NextResponse.json({ success: false, error: "Select an office first" }, { status: 403 }) };
  }
  try {
    const actingFor = can(session.office, capability)
      ? undefined
      : (await activeDelegationFor(session.office))?.grantingOffice as OfficeSlug | undefined;
    if (can(session.office, capability)) requireCapability(session.office, capability);
    else if (!actingFor || !(await hasEffectiveCapability(session.office, capability))) throw new CapabilityError(session.office, capability);
    return { office: session.office, actingFor };
  } catch (error) {
    if (!(error instanceof CapabilityError)) throw error;
    return {
      response: NextResponse.json({ success: false, error: "Forbidden", capability }, { status: 403 }),
    };
  }
}

export async function requirePageCapability(capability: Capability): Promise<OfficeSlug> {
  const session = await getAdminSession();
  if (!session) redirect("/admin");
  if (!session.office) redirect("/admin");
  try {
    if (can(session.office, capability)) requireCapability(session.office, capability);
    else if (!(await hasEffectiveCapability(session.office, capability))) throw new CapabilityError(session.office, capability);
    return session.office;
  } catch (error) {
    if (!(error instanceof CapabilityError)) throw error;
    redirect("/office?denied=1");
  }
}
