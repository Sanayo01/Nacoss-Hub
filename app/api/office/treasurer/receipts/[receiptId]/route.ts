import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { gateOfficeCapability } from "@/lib/office-access";
import { getTreasuryReceipt } from "@/lib/remaining-offices";

export async function GET(_request: Request, { params }: { params: { receiptId: string } }) {
  const gate = await gateOfficeCapability("finance.receipt.view");
  if ("response" in gate) return gate.response;
  try {
    const receipt = await getTreasuryReceipt(params.receiptId);
    if (!receipt) return NextResponse.json({ success: false, error: "Receipt not found." }, { status: 404 });
    const directory = path.resolve(process.cwd(), "storage", "treasury-receipts");
    const filePath = path.resolve(receipt.filePath);
    if (!filePath.startsWith(`${directory}${path.sep}`)) {
      console.error("Treasury receipt path escaped storage directory.");
      return NextResponse.json({ success: false, error: "Receipt storage path is invalid." }, { status: 500 });
    }
    const bytes = await readFile(filePath);
    const safeName = receipt.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": receipt.mimeType,
        "Content-Length": String(receipt.size),
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/office/treasurer/receipts/[receiptId] error:", error);
    return NextResponse.json({ success: false, error: "Could not download receipt." }, { status: 500 });
  }
}
