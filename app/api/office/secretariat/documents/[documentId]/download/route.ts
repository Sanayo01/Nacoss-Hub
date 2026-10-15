import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { gateOfficeCapability, getActingOffice } from "@/lib/office-access";
import { listOfficeDocuments } from "@/lib/secretariat";

export async function GET(req: Request, { params }: { params: { documentId: string } }) {
  const gate = await gateOfficeCapability("documents.view");
  if ("response" in gate) return gate.response;
  try {
    const document = (await listOfficeDocuments(gate.office, await getActingOffice(gate.office))).find((item) => item.id === params.documentId);
    if (!document) return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
    const versionNumber = new URL(req.url).searchParams.get("version");
    const version = versionNumber
      ? document.versions.find((item) => item.version === Number(versionNumber))
      : document.versions[0];
    const documentFilePath = version?.filePath;
    if (!documentFilePath) return NextResponse.json({ success: false, error: "Document file not found" }, { status: 404 });
    const prefix = "/storage/office-documents/";
    if (!documentFilePath.startsWith(prefix)) return NextResponse.json({ success: false, error: "Invalid document path" }, { status: 400 });
    const filename = documentFilePath.slice(prefix.length);
    if (!filename || path.basename(filename) !== filename) return NextResponse.json({ success: false, error: "Invalid document path" }, { status: 400 });
    const content = await readFile(path.join(process.cwd(), "storage", "office-documents", filename));
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET /api/office/secretariat/documents/[documentId]/download error:", error);
    return NextResponse.json({ success: false, error: "Could not download document" }, { status: 500 });
  }
}
