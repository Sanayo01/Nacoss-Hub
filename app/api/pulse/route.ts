import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getActivePulsePoll, getAllPulsePolls, submitPulseVote } from "@/lib/db";

const voteSchema = z.object({
  pollId: z.string().min(1, "Poll ID is required"),
  option: z.string().min(1, "Option is required"),
});

export async function GET() {
  try {
    const activePoll = await getActivePulsePoll();
    const allPolls = await getAllPulsePolls();
    const archivePolls = allPolls.filter((p) => !p.isActive || (activePoll && p.id !== activePoll.id));

    return NextResponse.json({
      success: true,
      activePoll,
      archivePolls,
    });
  } catch (error) {
    console.error("GET /api/pulse error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pulse polls" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = voteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { pollId, option } = validation.data;

    // Cookie-based duplicate vote prevention
    const cookieName = `voted_poll_${pollId}`;
    if (req.cookies.has(cookieName)) {
      return NextResponse.json(
        { success: false, error: "You have already voted in this poll!" },
        { status: 400 }
      );
    }

    await submitPulseVote(pollId, option);

    const updatedPoll = await getActivePulsePoll();

    const response = NextResponse.json({
      success: true,
      message: "Vote recorded successfully",
      poll: updatedPoll,
    });

    // Set cookie valid for 30 days
    response.cookies.set(cookieName, "true", {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("POST /api/pulse error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit vote" },
      { status: 500 }
    );
  }
}
