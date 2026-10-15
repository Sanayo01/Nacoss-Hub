import { NextResponse } from "next/server";
import { getDocuments } from "@/lib/db";

export async function GET() {
  try {
    const documents = await getDocuments();
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
