import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { getMinutesWorkspace, saveMinutesDraft, submitMinutesAndCreateApproval } from "@/lib/minutes-workflow";
import { EXECUTIVES_LIST } from "@/config/executives";

const actionItemSchema = z.object({
  decision: z.string().trim().min(1).max(1000),
  why: z.string().trim().max(1000).default(""),
  ownerOffice: z.string(),
  deadline: z.string().datetime().nullable().optional(),
  shareable: z.boolean().default(true),
});
const draftSchema = z.object({
  meetingId: z.string().min(1),
  content: z.string().max(10000).default(""),
  attendance: z.array(z.string()),
  agendaItems: z.array(actionItemSchema),
  submit: z.boolean().default(false),
});

export async function GET() {
  const gate = await gateOfficeCapability("ags.minutes.draft");
  if ("response" in gate) return gate.response;
  try {
    const meetings = await getMinutesWorkspace();
    return NextResponse.json({
      success: true,
      data: meetings.map(({ rsvps, ...meeting }) => ({
        ...meeting,
        date: meeting.date.toISOString(),
        minutes: meeting.minutes ? {
          ...meeting.minutes,
          attendance: JSON.parse(meeting.minutes.attendance) as string[],
          agendaItems: JSON.parse(meeting.minutes.agendaItems) as unknown[],
        } : null,
        rsvps: rsvps.map((rsvp) => ({ office: rsvp.office, response: rsvp.response })),
      })),
    });
  } catch (error) {
    console.error("GET /api/office/general-secretary/minutes error:", error);
    return NextResponse.json({ success: false, error: "Failed to load minutes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("ags.minutes.draft");
  if ("response" in gate) return gate.response;
  try {
    const parsed = draftSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    if (parsed.data.submit && gate.office === "general-secretary") {
      return NextResponse.json({ success: false, error: "General Secretary minutes drafts must be submitted by the AGS or another office." }, { status: 403 });
    }
    const validOffices = new Set(EXECUTIVES_LIST.map(({ officeSlug }) => officeSlug));
    if (
      parsed.data.attendance.some((office) => !validOffices.has(office)) ||
      parsed.data.agendaItems.some((item) => !validOffices.has(item.ownerOffice))
    ) {
      return NextResponse.json({ success: false, error: "Attendance and action owners must be valid offices." }, { status: 400 });
    }
    const minutesInput = {
      ...parsed.data,
      office: gate.office,
      agendaItems: parsed.data.agendaItems.map((item) => ({
        ...item,
        why: item.why ?? "",
        deadline: item.deadline ?? "",
      })),
    };
    if (parsed.data.submit) {
      const result = await submitMinutesAndCreateApproval(minutesInput);
      return NextResponse.json({ success: true, data: result }, { status: 202 });
    }
    const draft = await saveMinutesDraft({ ...minutesInput, submit: false });
    return NextResponse.json({ success: true, data: draft }, { status: 201 });
  } catch (error) {
    console.error("POST /api/office/general-secretary/minutes error:", error);
    return NextResponse.json({ success: false, error: "Could not save or submit minutes" }, { status: 500 });
  }
}
