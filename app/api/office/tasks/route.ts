import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isOfficeSlug } from "@/config/permissions";
import { gateOfficeCapability, hasEffectiveCapability } from "@/lib/office-access";
import { createOfficeTask, getOfficeTasks, updateOfficeTask } from "@/lib/office-data";

const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(3000).default(""),
  assignedToOffice: z.string(),
  dueDate: z.string().datetime().nullable().optional(),
  linkedMeetingId: z.string().nullable().optional(),
  linkedActionItem: z.string().nullable().optional(),
});
const updateTaskSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE"]),
});

export async function GET() {
  const gate = await gateOfficeCapability("tasks.view");
  if ("response" in gate) return gate.response;
  try {
    return NextResponse.json({ success: true, data: await getOfficeTasks(gate.office) });
  } catch (error) {
    console.error("GET /api/office/tasks error:", error);
    return NextResponse.json({ success: false, error: "Failed to load tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("tasks.create");
  if ("response" in gate) return gate.response;
  try {
    const parsed = createTaskSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    if (!isOfficeSlug(parsed.data.assignedToOffice)) {
      return NextResponse.json({ success: false, error: "Choose a valid destination office." }, { status: 400 });
    }
    if (parsed.data.assignedToOffice !== gate.office && !(await hasEffectiveCapability(gate.office, "tasks.assign"))) {
      return NextResponse.json({ success: false, error: "Forbidden: task assignment is not permitted." }, { status: 403 });
    }
    const topTierOffices = new Set(["president", "vice-president", "general-secretary", "assistant-general-secretary"]);
    if (
      gate.office === "vice-president" &&
      topTierOffices.has(parsed.data.assignedToOffice) &&
      !(await hasEffectiveCapability(gate.office, "president.manage"))
    ) {
      return NextResponse.json({ success: false, error: "The Vice President may assign tasks only to non-top-tier offices unless Acting President." }, { status: 403 });
    }
    const task = await createOfficeTask({
      title: parsed.data.title,
      description: parsed.data.description,
      assignedByOffice: gate.office,
      assignedToOffice: parsed.data.assignedToOffice,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      linkedMeetingId: parsed.data.linkedMeetingId,
      linkedActionItem: parsed.data.linkedActionItem,
    });
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/tasks error:", error);
    return NextResponse.json({ success: false, error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const gate = await gateOfficeCapability("tasks.update");
  if ("response" in gate) return gate.response;
  try {
    const parsed = updateTaskSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const data = await updateOfficeTask({ ...parsed.data, office: gate.office });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PATCH /api/office/tasks error:", error);
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 });
  }
}
