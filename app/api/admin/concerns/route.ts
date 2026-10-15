import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminConcerns, updateConcernStatusAndResponse } from "@/lib/db";
import { sanitizeText } from "@/lib/utils";

const updateStatusSchema = z.object({
  concernId: z.string().min(1, "Concern ID is required"),
  status: z.enum(["RECEIVED", "BEING_HANDLED", "RESOLVED", "DECLINED"]),
  publicResponse: z.string().nullable().optional(),
  updateNote: z.string().min(3, "Update note is required for the audit trail"),
});

export async function GET(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const office = searchParams.get("office") || undefined;
  const status = searchParams.get("status") || undefined;

  try {
    const concerns = await getAdminConcerns({ office, status });
    return NextResponse.json({ success: true, data: concerns });
  } catch (error) {
    console.error("GET /api/admin/concerns error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch concerns" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = updateStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { concernId, status, publicResponse, updateNote } = validation.data;

    const result = await updateConcernStatusAndResponse({
      concernId,
      status,
      publicResponse: publicResponse ? sanitizeText(publicResponse) : publicResponse,
      updateNote: sanitizeText(updateNote),
    });

    return NextResponse.json({
      success: true,
      message: "Concern status and public response updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("PATCH /api/admin/concerns error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update concern" },
      { status: 500 }
    );
  }
}
