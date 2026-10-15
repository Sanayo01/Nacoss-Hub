import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { gateOfficeCapability } from "@/lib/office-access";
import { saveTreasuryReceipt } from "@/lib/remaining-offices";

const MAX_BYTES = 10 * 1024 * 1024;
const uploadSchema = z.object({
  file: z.custom<File>((value) => typeof File !== "undefined" && value instanceof File)
    .refine((file) => file.size > 0, "Choose a receipt file.")
    .refine((file) => file.size <= MAX_BYTES, "Receipt files must be 10 MB or smaller."),
});

function detectMime(bytes: Buffer): string | null {
  if (bytes.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

export async function POST(request: NextRequest) {
  const gate = await gateOfficeCapability("finance.receipt.upload");
  if ("response" in gate) return gate.response;
  let savedPath: string | null = null;
  try {
    const form = await request.formData();
    const parsed = uploadSchema.safeParse({ file: form.get("file") });
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid receipt upload." }, { status: 400 });
    }
    const file = parsed.data.file;
    const bytes = Buffer.from(await file.arrayBuffer());
    const mimeType = detectMime(bytes);
    if (!mimeType || file.type !== mimeType) return NextResponse.json({ success: false, error: "Only valid PDF, JPEG, PNG, and WebP receipts are accepted." }, { status: 400 });
    const directory = path.join(process.cwd(), "storage", "treasury-receipts");
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}${mimeType === "application/pdf" ? ".pdf" : mimeType === "image/jpeg" ? ".jpg" : mimeType === "image/png" ? ".png" : ".webp"}`;
    savedPath = path.join(directory, filename);
    await writeFile(savedPath, bytes, { flag: "wx" });
    const receipt = await saveTreasuryReceipt({
      filePath: savedPath,
      fileName: path.basename(file.name).replace(/[^\w.-]/g, "_").slice(0, 160) || filename,
      mimeType,
      size: file.size,
      office: gate.office,
    });
    return NextResponse.json({ success: true, data: { id: receipt.id, fileName: receipt.fileName } }, { status: 201 });
  } catch (error) {
    if (savedPath) {
      try { await unlink(savedPath); }
      catch (cleanupError) { console.error("Could not remove incomplete treasury receipt upload:", cleanupError); }
    }
    console.error("POST /api/office/treasurer/receipts error:", error);
    return NextResponse.json({ success: false, error: "Could not save receipt." }, { status: 500 });
  }
}
