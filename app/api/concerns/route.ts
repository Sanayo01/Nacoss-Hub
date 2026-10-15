import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createConcern, getExecutiveBySlug } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateTrackingId, sanitizeText } from "@/lib/utils";
import { getTargetOfficeSlug } from "@/config/offices";
import { sendConcernEmails } from "@/lib/mailer";
import { appendAuditLog } from "@/lib/audit";

const createConcernSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(120),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
  isAnonymous: z.boolean().default(false),
  senderName: z.string().nullable().optional(),
  senderEmail: z.string().email("Invalid email address").nullable().optional().or(z.literal("")),
  level: z.string().nullable().optional(),
  targetOfficeSlug: z.string().optional(),
  honeypot: z.string().optional(), // Spam honeypot field
});

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = checkRateLimit(ip, 5, 60 * 60 * 1000); // 5 per hour
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. You can submit a maximum of 5 concerns per hour.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 2. Anti-Spam Honeypot Check
    if (body.honeypot && body.honeypot.trim() !== "") {
      // Quietly reject bot submissions
      return NextResponse.json({ success: true, trackingId: generateTrackingId() });
    }

    // 3. Zod Input Validation
    const validation = createConcernSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 4. Sanitize Input Text
    const cleanSubject = sanitizeText(data.subject);
    const cleanMessage = sanitizeText(data.message);
    const cleanName = data.senderName ? sanitizeText(data.senderName) : null;
    const cleanEmail = data.senderEmail && data.senderEmail.trim() !== "" ? data.senderEmail.trim() : null;

    // 5. Derive Target Office
    const selectedOfficeSlug = data.targetOfficeSlug || getTargetOfficeSlug(data.category);
    const targetExec = await getExecutiveBySlug(selectedOfficeSlug);
    const targetOfficeName = targetExec ? targetExec.position : "General Secretary";
    const targetOfficeEmail = targetExec ? targetExec.officeEmail : "sanayodeji087@gmail.com";

    // 6. Generate Tracking ID & DB Record
    const trackingId = generateTrackingId();
    const concern = await createConcern({
      trackingId,
      category: data.category,
      subject: cleanSubject,
      message: cleanMessage,
      isAnonymous: data.isAnonymous,
      senderName: data.isAnonymous ? null : cleanName,
      senderEmail: data.isAnonymous ? null : cleanEmail,
      level: data.level || null,
      targetOfficeSlug: selectedOfficeSlug,
    });
    await appendAuditLog({
      action: "CONCERN_SUBMITTED",
      office: "system",
      entityType: "Concern",
      entityId: concern.id,
      details: { trackingId, category: data.category, targetOffice: selectedOfficeSlug, isAnonymous: data.isAnonymous },
      occurredAt: new Date().toISOString(),
    });

    // 7. Dispatch Emails asynchronously
    try {
      await sendConcernEmails({
        trackingId,
        category: data.category,
        subject: cleanSubject,
        message: cleanMessage,
        isAnonymous: data.isAnonymous,
        senderName: data.isAnonymous ? null : cleanName,
        senderEmail: data.isAnonymous ? null : cleanEmail,
        level: data.level,
        targetOfficeSlug: selectedOfficeSlug,
        targetOfficeName,
        targetOfficeEmail,
      });
    } catch (mailError) {
      console.error("Email dispatch warning:", mailError);
    }

    return NextResponse.json({
      success: true,
      trackingId,
      targetOffice: targetOfficeName,
      createdAt: concern.createdAt,
    });
  } catch (error) {
    console.error("POST /api/concerns error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error submitting concern" },
      { status: 500 }
    );
  }
}
