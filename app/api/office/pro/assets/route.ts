import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { createMediaAsset, listProStudio } from "@/lib/three-offices";
import { sanitizedText } from "@/lib/input-validation";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);
const MAX_BYTES = 10 * 1024 * 1024;
const uploadSchema = z.object({
  file: z.custom<File>((value) => typeof File !== "undefined" && value instanceof File)
    .refine((file) => file.size > 0, "Choose an asset file.")
    .refine((file) => file.size <= MAX_BYTES, "Asset files must be 10 MB or smaller.")
    .refine((file) => ALLOWED_TYPES.has(file.type), "Only JPEG, PNG, WebP, GIF, and PDF assets are allowed."),
  title: sanitizedText(2, 160),
  description: sanitizedText(0, 2000).default(""),
});

export async function GET() {
  const gate = await gateOfficeCapability("pro.assets");
  if ("response" in gate) return gate.response;
  try {
    const studio = await listProStudio();
    return NextResponse.json({ success: true, data: studio.assets });
  } catch (error) {
    console.error("GET /api/office/pro/assets error:", error);
    return NextResponse.json({ success: false, error: "Failed to load assets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await gateOfficeCapability("pro.assets");
  if ("response" in gate) return gate.response;
  let savedPath: string | null = null;
  try {
    const form = await req.formData();
    const file = form.get("file");
    const parsed = uploadSchema.safeParse({
      file,
      title: form.get("title"),
      description: form.get("description") ?? "",
    });
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid asset upload." }, { status: 400 });
    }
    const { title, description } = parsed.data;
    const upload = parsed.data.file;
    const safeExtension = path.extname(upload.name).toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 10);
    const filename = `${randomUUID()}${safeExtension}`;
    const directory = path.join(process.cwd(), "storage", "pro-assets");
    await mkdir(directory, { recursive: true });
    savedPath = path.join(directory, filename);
    await writeFile(savedPath, Buffer.from(await upload.arrayBuffer()), { flag: "wx" });
    const asset = await createMediaAsset({
      title, description, filePath: savedPath,
      fileName: path.basename(upload.name).replace(/[^\w.-]/g, "_").slice(0, 160),
      mimeType: upload.type, size: upload.size, office: gate.office,
    });
    return NextResponse.json({ success: true, data: asset }, { status: 201 });
  } catch (error) {
    if (savedPath) {
      const { unlink } = await import("fs/promises");
      try { await unlink(savedPath); }
      catch (cleanupError) { console.error("Failed to clean up orphaned PRO asset:", cleanupError); }
    }
    console.error("POST /api/office/pro/assets error:", error);
    return NextResponse.json({ success: false, error: "Failed to save asset" }, { status: 500 });
  }
}
