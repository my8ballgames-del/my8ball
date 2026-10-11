import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { reason, evidenceNotes } = await req.json();

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a descriptive reason for the dispute." },
        { status: 400 }
      );
    }

    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.player1Id !== session.id && match.player2Id !== session.id) {
      return NextResponse.json(
        { error: "Only match participants can lodge a formal dispute." },
        { status: 403 }
      );
    }

    // Create dispute and update match state
    const dispute = await prisma.$transaction(async (tx) => {
      const d = await tx.dispute.create({
        data: {
          matchId: match.id,
          raisedById: session.id,
          reason,
          evidenceNotes: evidenceNotes || null,
          status: "OPEN",
        },
      });

      await tx.match.update({
        where: { id: match.id },
        data: {
          status: "DISPUTED",
        },
      });

      await tx.matchConfirmation.upsert({
        where: { matchId: match.id },
        update: {
          disputed: true,
        },
        create: {
          matchId: match.id,
          disputed: true,
        },
      });

      // Release players from being locked in match
      await tx.userAvailability.update({
        where: { userId: match.player1Id },
        data: { status: "AVAILABLE_INDIVIDUAL", activeMatchId: null },
      });
      await tx.userAvailability.update({
        where: { userId: match.player2Id },
        data: { status: "AVAILABLE_INDIVIDUAL", activeMatchId: null },
      });

      return d;
    });

    return NextResponse.json({
      success: true,
      dispute,
      message: "Dispute submitted successfully. An accredited referee or administrator will review the evidence.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
