import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { createApprovalRequest } from "@/lib/approvals";
import { getApprovedSiwesPlacements, getApprovedAlumni, db } from "@/lib/db";
import { appendAuditLog } from "@/lib/audit";

function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '""';
  return `"${String(field).replace(/"/g, '""')}"`;
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("serious.submit");
  if ("response" in gate) return gate.response;
  try {
    const parsed = z.object({}).safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid export request" }, { status: 400 });
    }
    const request = await createApprovalRequest({
      type: "FULL_STUDENT_DATA_EXPORT",
      payload: { title: "Export approved student placement and alumni records" },
      makerOffice: gate.office,
    });
    return NextResponse.json({ success: true, data: request }, { status: 202 });
  } catch (error) {
    console.error("POST /api/admin/export error:", error);
    return NextResponse.json({ success: false, error: "Failed to request data export" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const gate = await gateOfficeCapability("reports.view");
  if ("response" in gate) return gate.response;
  const requestId = new URL(req.url).searchParams.get("requestId");
  if (!requestId) {
    return NextResponse.json(
      { success: false, error: "A two-key approved export request is required." },
      { status: 403 }
    );
  }
  try {
    const approval = await db.approvalRequest.findUnique({
      where: { id: requestId },
      include: { decisions: true },
    });
    if (
      !approval ||
      approval.type !== "FULL_STUDENT_DATA_EXPORT" ||
      approval.status !== "APPROVED" ||
      approval.makerOffice !== gate.office ||
      approval.approvalMode !== "ALL"
    ) {
      return NextResponse.json({ success: false, error: "Export has not received two-key approval." }, { status: 403 });
    }
    const approvers = JSON.parse(approval.requiredApprovers) as string[];
    const approvedBy = new Set(approval.decisions.filter((item) => item.decision === "APPROVED").map((item) => item.office));
    if (approvers.some((office) => !approvedBy.has(office)) || approvedBy.size < 2) {
      return NextResponse.json({ success: false, error: "Both required offices must approve the export." }, { status: 403 });
    }

    const [alumni, placements] = await Promise.all([getApprovedAlumni(), getApprovedSiwesPlacements()]);
    const headers = ["Record Type", "Name", "Level or Graduation Year", "Company", "Role", "City", "Tech Stack", "Advice or Tips", "Approved At"];
    const placementRows = placements.map((item) => [
      "Placement", item.studentName, item.level, item.company, item.role, item.city, item.techStack, item.tipsToApply, item.createdAt.toISOString(),
    ].map(escapeCsvField).join(","));
    const alumniRows = alumni.map((item) => [
      "Alumnus", item.name, item.graduationYear, item.currentCompany, item.currentRole, item.city, item.techStack, item.advice, item.createdAt.toISOString(),
    ].map(escapeCsvField).join(","));
    await appendAuditLog({
      action: "APPROVED_STUDENT_DATA_EXPORT",
      office: gate.office,
      entityType: "ApprovalRequest",
      entityId: approval.id,
      details: { placements: placements.length, alumni: alumni.length },
      occurredAt: new Date().toISOString(),
    });
    const csvContent = [headers.map(escapeCsvField).join(","), ...placementRows, ...alumniRows].join("\r\n");
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="nacoss-unilag-approved-student-records.csv"',
      },
    });
  } catch (error) {
    console.error("GET /api/admin/export error:", error);
    return NextResponse.json({ success: false, error: "Failed to export approved records" }, { status: 500 });
  }
}
