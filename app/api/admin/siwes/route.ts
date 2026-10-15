import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getAllSiwesPlacements,
  getAllAlumni,
  getSiwesCheckIns,
  getRemovalRequests,
  updateSiwesPlacementApproval,
  updateAlumnusApproval,
  deleteSiwesPlacement,
  deleteAlumnus,
  updateRemovalRequestResolved,
} from "@/lib/db";

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [placements, alumni, checkIns, removalRequests] = await Promise.all([
      getAllSiwesPlacements(),
      getAllAlumni(),
      getSiwesCheckIns(),
      getRemovalRequests(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        placements,
        alumni,
        checkIns,
        removalRequests,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/siwes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load moderation data" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, type, id, isApproved, isResolved } = body;

    if (action === "toggle-approval") {
      if (type === "placement") {
        await updateSiwesPlacementApproval(id, Boolean(isApproved));
      } else if (type === "alumni") {
        await updateAlumnusApproval(id, Boolean(isApproved));
      }
      return NextResponse.json({ success: true, message: "Approval status updated" });
    }

    if (action === "resolve-removal") {
      await updateRemovalRequestResolved(id, Boolean(isResolved));
      return NextResponse.json({ success: true, message: "Removal request updated" });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/admin/siwes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform moderation action" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ success: false, error: "Type and ID required" }, { status: 400 });
    }

    if (type === "placement") {
      await deleteSiwesPlacement(id);
    } else if (type === "alumni") {
      await deleteAlumnus(id);
    }

    return NextResponse.json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/siwes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete record" },
      { status: 500 }
    );
  }
}
