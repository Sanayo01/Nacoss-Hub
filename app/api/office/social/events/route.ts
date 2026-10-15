import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { isOfficeSlug } from "@/config/permissions";
import { createOfficeTask } from "@/lib/office-data";
import { createSocialEvent, getSocialEventForTask, listSocialEvents, updateSocialEvent, updateVolunteerHours } from "@/lib/three-offices";

const createSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(5000),
  venue: z.string().trim().min(2).max(300),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  budgetRequest: z.number().min(0).max(100000000),
  checklist: z.array(z.string().trim().min(1).max(200)).max(30).default([]),
});
const updateSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("REPORT"), eventId: z.string().min(1), report: z.string().trim().min(5).max(10000) }),
  z.object({ action: z.literal("CHECKLIST"), eventId: z.string().min(1), checklist: z.array(z.string().trim().min(1).max(200)).max(30) }),
  z.object({ action: z.literal("HOURS"), volunteerId: z.string().min(1), hours: z.number().min(0).max(200) }),
  z.object({
    action: z.literal("TASK"), eventId: z.string().min(1), title: z.string().trim().min(3).max(160),
    assignedToOffice: z.string(), dueDate: z.string().datetime().nullable().optional(),
  }),
]);

export async function GET() {
  const gate = await gateOfficeCapability("social.events");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await listSocialEvents() });
  } catch (error) {
    console.error("GET /api/office/social/events error:", error);
    return NextResponse.json({ success: false, error: "Failed to load event planner" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("social.events");
  if ("response" in gate) return gate.response;
  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    const startsAt = new Date(parsed.data.startsAt);
    const endsAt = new Date(parsed.data.endsAt);
    if (startsAt <= new Date() || endsAt <= startsAt) {
      return NextResponse.json({ success: false, error: "Choose a future start time and an end time after the start." }, { status: 400 });
    }
    const event = await createSocialEvent({ ...parsed.data, startsAt, endsAt, office: gate.office });
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/social/events error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit event and budget for approval" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
  const capability = parsed.data.action === "HOURS" ? "social.volunteers" :
    parsed.data.action === "REPORT" ? "social.reports" : "social.events";
  const gate = await gateOfficeCapability(capability);
  if ("response" in gate) return gate.response;
  try {
    if (parsed.data.action === "TASK") {
      if (!isOfficeSlug(parsed.data.assignedToOffice)) {
        return NextResponse.json({ success: false, error: "Choose a valid task owner office." }, { status: 400 });
      }
      const taskCreationGate = await gateOfficeCapability("tasks.create");
      if ("response" in taskCreationGate) return taskCreationGate.response;
      const event = await getSocialEventForTask(parsed.data.eventId);
      if (!event) return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
      if (parsed.data.assignedToOffice !== gate.office) {
        const taskGate = await gateOfficeCapability("tasks.assign");
        if ("response" in taskGate) return taskGate.response;
      }
      const task = await createOfficeTask({
        title: parsed.data.title,
        description: `Social event task: ${event.title}`,
        assignedByOffice: gate.office,
        assignedToOffice: parsed.data.assignedToOffice,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        linkedActionItem: `SOCIAL_EVENT:${event.id}`,
      });
      return NextResponse.json({ success: true, data: task }, { status: 201 });
    }
    const result = parsed.data.action === "HOURS"
      ? await updateVolunteerHours({ id: parsed.data.volunteerId, hours: parsed.data.hours, office: gate.office })
      : await updateSocialEvent({
          id: parsed.data.eventId, office: gate.office,
          ...(parsed.data.action === "REPORT" ? { report: parsed.data.report } : { checklist: parsed.data.checklist }),
        });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("PATCH /api/office/social/events error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not update event" }, { status: 409 });
  }
}
