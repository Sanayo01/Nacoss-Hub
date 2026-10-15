import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getApprovedSiwesPlacements, getApprovedAlumni } from "@/lib/db";

function escapeCsvField(field: any): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "placements";

  if (type === "alumni") {
    const alumni = await getApprovedAlumni();
    const headers = ["Name", "Graduation Year", "Company", "Role", "City", "Tech Stack", "LinkedIn", "Advice", "Approved At"];
    const rows = alumni.map((a) => [
      escapeCsvField(a.name),
      escapeCsvField(a.graduationYear),
      escapeCsvField(a.currentCompany),
      escapeCsvField(a.currentRole),
      escapeCsvField(a.city),
      escapeCsvField(a.techStack),
      escapeCsvField(a.linkedinUrl || ""),
      escapeCsvField(a.advice),
      escapeCsvField(a.createdAt.toISOString()),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="nacos-unilag-approved-alumni.csv"',
      },
    });
  }

  // Default: Placements
  const placements = await getApprovedSiwesPlacements();
  const headers = ["Student Name", "Level", "Company", "Role", "City", "Tech Stack", "Start Date", "End Date", "How I Got In", "Tips", "Contact Preference", "Approved At"];
  const rows = placements.map((p) => [
    escapeCsvField(p.studentName),
    escapeCsvField(p.level),
    escapeCsvField(p.company),
    escapeCsvField(p.role),
    escapeCsvField(p.city),
    escapeCsvField(p.techStack),
    escapeCsvField(p.startDate || ""),
    escapeCsvField(p.endDate || ""),
    escapeCsvField(p.howIGotIn || ""),
    escapeCsvField(p.tipsToApply),
    escapeCsvField(p.contactPreference),
    escapeCsvField(p.createdAt.toISOString()),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="nacos-unilag-approved-placements.csv"',
    },
  });
}
