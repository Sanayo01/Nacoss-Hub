import { NextRequest, NextResponse } from "next/server";
import { getPublicConcernTracking } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params;
    if (!trackingId || trackingId.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Tracking ID is required" },
        { status: 400 }
      );
    }

    const trackingData = await getPublicConcernTracking(trackingId.trim().toUpperCase());

    if (!trackingData) {
      return NextResponse.json(
        { success: false, error: "Concern not found with this Tracking ID" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: trackingData,
    });
  } catch (error) {
    console.error("GET /api/concerns/[trackingId] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tracking details" },
      { status: 500 }
    );
  }
}
