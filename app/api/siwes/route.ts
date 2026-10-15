import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getApprovedSiwesPlacements,
  getApprovedAlumni,
  createSiwesPlacement,
  createAlumnus,
  createSiwesCheckIn,
  createRemovalRequest,
} from "@/lib/db";
import { sanitizeText } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";

const placementSchema = z.object({
  studentName: z.string().min(2, "Name is required").max(100),
  level: z.string().min(1, "Level is required"),
  company: z.string().min(2, "Company is required").max(100),
  role: z.string().min(2, "Role is required").max(100),
  techStack: z.string().min(2, "Tech stack is required").max(200),
  city: z.string().min(2, "City is required").max(100),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  howIGotIn: z.string().optional().nullable(),
  tipsToApply: z.string().min(5, "Tips must be at least 5 characters").max(2000),
  contactPreference: z.enum(["none", "LinkedIn only", "email via the Hub"]).default("none"),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the privacy and display consent terms" }),
  }),
});

const alumnusSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  graduationYear: z.string().min(4, "Graduation year is required").max(4),
  currentCompany: z.string().min(2, "Company is required").max(100),
  currentRole: z.string().min(2, "Role is required").max(100),
  city: z.string().min(2, "City is required").max(100),
  techStack: z.string().min(2, "Tech stack is required").max(200),
  advice: z.string().min(5, "Advice must be at least 5 characters").max(2000),
  linkedinUrl: z.string().url("Valid LinkedIn URL required").optional().nullable().or(z.literal("")),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the privacy and display consent terms" }),
  }),
});

const checkInSchema = z.object({
  studentName: z.string().min(2, "Student name is required").max(100),
  level: z.string().min(1, "Level is required"),
  company: z.string().min(2, "Company is required").max(100),
  status: z.enum(["STILL_PLACED", "COMPLETED", "SEEKING_HELP"]),
  notes: z.string().max(1000).optional().nullable(),
  needsHelp: z.boolean().default(false),
});

const removalSchema = z.object({
  targetType: z.enum(["PLACEMENT", "ALUMNUS"]),
  targetId: z.string().min(1, "Target ID is required"),
  reason: z.string().min(5, "Reason is required").max(1000),
  requesterEmail: z.string().email("Valid email required").optional().nullable().or(z.literal("")),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");

    if (view === "alumni") {
      const alumni = await getApprovedAlumni();
      return NextResponse.json({ success: true, data: alumni });
    }

    // Default: both placements and alumni for fast client hydration
    const [placements, alumni] = await Promise.all([
      getApprovedSiwesPlacements(),
      getApprovedAlumni(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        placements,
        alumni,
      },
    });
  } catch (error) {
    console.error("GET /api/siwes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch SIWES directory" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = checkRateLimit(`siwes_submit_${ip}`, 10, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const type = body.type || "placement";

    if (type === "placement") {
      const validation = placementSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const d = validation.data;
      const placement = await createSiwesPlacement({
        studentName: sanitizeText(d.studentName),
        level: sanitizeText(d.level),
        company: sanitizeText(d.company),
        role: sanitizeText(d.role),
        techStack: sanitizeText(d.techStack),
        city: sanitizeText(d.city),
        startDate: d.startDate ? sanitizeText(d.startDate) : null,
        endDate: d.endDate ? sanitizeText(d.endDate) : null,
        howIGotIn: d.howIGotIn ? sanitizeText(d.howIGotIn) : null,
        tipsToApply: sanitizeText(d.tipsToApply),
        contactPreference: d.contactPreference,
        consentGiven: d.consentGiven,
      });

      return NextResponse.json({
        success: true,
        message: "Thanks, it will appear after review.",
        data: placement,
      });
    }

    if (type === "alumnus") {
      const validation = alumnusSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const d = validation.data;
      const alumnus = await createAlumnus({
        name: sanitizeText(d.name),
        graduationYear: sanitizeText(d.graduationYear),
        currentCompany: sanitizeText(d.currentCompany),
        currentRole: sanitizeText(d.currentRole),
        city: sanitizeText(d.city),
        techStack: sanitizeText(d.techStack),
        advice: sanitizeText(d.advice),
        linkedinUrl: d.linkedinUrl ? d.linkedinUrl.trim() : null,
        consentGiven: d.consentGiven,
      });

      return NextResponse.json({
        success: true,
        message: "Thanks, it will appear after review.",
        data: alumnus,
      });
    }

    if (type === "check-in") {
      const validation = checkInSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const d = validation.data;
      const checkIn = await createSiwesCheckIn({
        studentName: sanitizeText(d.studentName),
        level: sanitizeText(d.level),
        company: sanitizeText(d.company),
        status: d.status,
        notes: d.notes ? sanitizeText(d.notes) : null,
        needsHelp: d.needsHelp,
      });

      return NextResponse.json({
        success: true,
        message: "Check-in received! The department executive team is here to support you.",
        data: checkIn,
      });
    }

    if (type === "removal") {
      const validation = removalSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const d = validation.data;
      const request = await createRemovalRequest({
        targetType: d.targetType,
        targetId: sanitizeText(d.targetId),
        reason: sanitizeText(d.reason),
        requesterEmail: d.requesterEmail ? d.requesterEmail.trim() : null,
      });

      return NextResponse.json({
        success: true,
        message: "Request received. The Secretariat will process your request promptly.",
        data: request,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid submission type" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/siwes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
