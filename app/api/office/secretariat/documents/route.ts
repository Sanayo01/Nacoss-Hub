import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability, getActingOffice } from "@/lib/office-access";
import { createOfficeDocument, listOfficeDocuments, removeOfficeDocumentUpload, saveOfficeDocumentUpload, type DocumentPermission } from "@/lib/secretariat";

const permissions = ["PUBLIC", "MEMBERS", "EXECUTIVES", "OFFICE_ONLY", "GENSEC_ONLY"] as const;
const schema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).default(""),
  folder: z.string().trim().min(1).max(100),
  session: z.string().trim().min(1).max(100),
  permission: z.enum(permissions),
  tags: z.string().max(1000).default(""),
  driveLink: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  const gate = await gateOfficeCapability("documents.view");
  if ("response" in gate) return gate.response;
  try {
    const documents = await listOfficeDocuments(gate.office, await getActingOffice(gate.office));
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error("GET /api/office/secretariat/documents error:", error);
    return NextResponse.json({ success: false, error: "Failed to load documents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("ags.documents.file");
  if ("response" in gate) return gate.response;
  let filePath: string | null = null;
  try {
    const form = await req.formData();
    const values = Object.fromEntries([...form.entries()].filter(([key]) => key !== "file").map(([key, value]) => [key, String(value)]));
    const parsed = schema.safeParse(values);
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    if (parsed.data.permission === "GENSEC_ONLY" && gate.office !== "general-secretary") {
      return NextResponse.json({ success: false, error: "Only the General Secretary may create GenSec-only records." }, { status: 403 });
    }
    const link = parsed.data.driveLink ? new URL(parsed.data.driveLink) : null;
    if (link && link.protocol !== "https:") return NextResponse.json({ success: false, error: "Drive links must use HTTPS." }, { status: 400 });
    const uploaded = form.get("file");
    if (uploaded instanceof File && uploaded.size) filePath = await saveOfficeDocumentUpload(uploaded);
    const document = await createOfficeDocument({
      ...parsed.data,
      tags: parsed.data.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      driveLink: parsed.data.driveLink || null,
      filePath,
      createdBy: gate.office,
    });
    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    if (filePath) {
      try { await removeOfficeDocumentUpload(filePath); }
      catch (cleanupError) { console.error("Failed to clean up an unlinked office document upload:", cleanupError); }
    }
    console.error("POST /api/office/secretariat/documents error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Failed to file document" }, { status: 400 });
  }
}
