import { NextRequest, NextResponse } from "next/server";
import { gateOfficeCapability, getActingOffice } from "@/lib/office-access";
import { addOfficeDocumentVersion, removeOfficeDocumentUpload, saveOfficeDocumentUpload } from "@/lib/secretariat";

export async function POST(req: NextRequest, { params }: { params: { documentId: string } }) {
  const gate = await gateOfficeCapability("ags.documents.file");
  if ("response" in gate) return gate.response;
  let filePath: string | null = null;
  try {
    const form = await req.formData();
    const driveLink = String(form.get("driveLink") ?? "").trim();
    if (driveLink) {
      const parsed = new URL(driveLink);
      if (parsed.protocol !== "https:") return NextResponse.json({ success: false, error: "Drive links must use HTTPS." }, { status: 400 });
    }
    const file = form.get("file");
    if (file instanceof File && file.size) filePath = await saveOfficeDocumentUpload(file);
    if (!filePath && !driveLink) return NextResponse.json({ success: false, error: "Choose a file or provide an HTTPS Drive link." }, { status: 400 });
    const version = await addOfficeDocumentVersion({
      documentId: params.documentId,
      office: gate.office,
      actingFor: await getActingOffice(gate.office),
      filePath,
      driveLink: driveLink || null,
    });
    return NextResponse.json({ success: true, data: version }, { status: 201 });
  } catch (error) {
    if (filePath) {
      try { await removeOfficeDocumentUpload(filePath); }
      catch (cleanupError) { console.error("Failed to clean up an unlinked document version:", cleanupError); }
    }
    console.error("POST /api/office/secretariat/documents/[documentId]/versions error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Could not add version" }, { status: 400 });
  }
}
