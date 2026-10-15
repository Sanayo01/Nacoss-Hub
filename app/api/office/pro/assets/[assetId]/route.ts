import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { gateOfficeCapability } from "@/lib/office-access";
import { getMediaAsset } from "@/lib/three-offices";

export async function GET(_req: Request, { params }: { params: { assetId: string } }) {
  const gate = await gateOfficeCapability("pro.assets");
  if ("response" in gate) return gate.response;
  try {
    const asset = await getMediaAsset(params.assetId);
    if (!asset) return NextResponse.json({ success: false, error: "Asset not found." }, { status: 404 });
    const base = path.resolve(process.cwd(), "storage", "pro-assets") + path.sep;
    if (!path.resolve(asset.filePath).startsWith(base)) {
      return NextResponse.json({ success: false, error: "Invalid asset path." }, { status: 400 });
    }
    const bytes = await readFile(asset.filePath);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": asset.mimeType,
        "Content-Disposition": `attachment; filename="${asset.fileName.replace(/["\r\n]/g, "")}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/office/pro/assets/[assetId] error:", error);
    return NextResponse.json({ success: false, error: "Failed to download asset" }, { status: 500 });
  }
}
