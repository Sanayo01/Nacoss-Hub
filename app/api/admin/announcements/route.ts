import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { createApprovalRequest } from "@/lib/approvals";
import { sanitizeText } from "@/lib/utils";

const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  body: z.string().min(10, "Body must be at least 10 characters"),
  category: z.enum(["General", "Academic", "Event", "Urgent", "Deadline"]),
  pinned: z.boolean().default(false),
  authorOfficeSlug: z.string().default("general-secretary"),
});

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("announcements.publish");
  if ("response" in gate) return gate.response;

  try {
    const body = await req.json();
    const validation = announcementSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const cleanTitle = sanitizeText(data.title);
    const cleanBody = sanitizeText(data.body);

    const request = await createApprovalRequest({
      type: data.category === "Urgent" ? "URGENT_ANNOUNCEMENT" : "OFFICIAL_ANNOUNCEMENT",
      payload: {
        title: cleanTitle,
        body: cleanBody,
        category: data.category,
        pinned: data.pinned,
      },
      makerOffice: gate.office,
    });

    return NextResponse.json({
      success: true,
      message: "Announcement submitted for approval",
      data: request,
    });
  } catch (error) {
    console.error("POST /api/admin/announcements error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish announcement" },
      { status: 500 }
    );
  }
}
