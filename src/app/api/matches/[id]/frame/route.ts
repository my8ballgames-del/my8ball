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
    const { winnerId, breakPlayerId, foulEvent, notes, durationSeconds = 180 } =
      await req.json();

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        frames: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: `Match is not in progress (Current status: ${match.status})` },
        { status: 400 }
      );
    }

    // Authorization: User must be player1, player2, referee, or admin
    const isParticipant = match.player1Id === session.id || match.player2Id === session.id;
    const isOfficial = ["SUPER_ADMIN", "REFEREE", "ORGANIZER"].includes(session.role);

    if (!isParticipant && !isOfficial) {
      return NextResponse.json(
        { error: "Only match participants or tournament officials can record frames." },
        { status: 403 }
      );
    }

    if (winnerId !== match.player1Id && winnerId !== match.player2Id) {
      return NextResponse.json(
        { error: "Frame winner must be one of the match participants" },
        { status: 400 }
      );
    }

    const nextFrameNumber = match.frames.length + 1;
    const isPlayer1Winner = winnerId === match.player1Id;

    const newScore1 = match.scorePlayer1 + (isPlayer1Winner ? 1 : 0);
    const newScore2 = match.scorePlayer2 + (!isPlayer1Winner ? 1 : 0);

    const hasReachedTarget = newScore1 >= match.raceTo || newScore2 >= match.raceTo;
    const matchWinnerId = hasReachedTarget
      ? newScore1 >= match.raceTo
        ? match.player1Id
        : match.player2Id
      : null;

    // Transaction to create frame and update match score
    const updatedMatch = await prisma.$transaction(async (tx) => {
      await tx.matchFrame.create({
        data: {
          matchId: match.id,
          frameNumber: nextFrameNumber,
          winnerId,
          breakPlayerId: breakPlayerId || null,
          foulEvent: foulEvent || null,
          notes: notes || null,
          durationSeconds: parseInt(durationSeconds) || 180,
        },
      });

      const updated = await tx.match.update({
        where: { id: match.id },
        data: {
          scorePlayer1: newScore1,
          scorePlayer2: newScore2,
          winnerId: matchWinnerId,
          status: hasReachedTarget ? "AWAITING_CONFIRMATION" : "IN_PROGRESS",
          ...(hasReachedTarget && { endedAt: new Date() }),
        },
      });

      if (hasReachedTarget) {
        await tx.matchConfirmation.upsert({
          where: { matchId: match.id },
          create: {
            matchId: match.id,
            player1Confirmed: session.id === match.player1Id,
            player2Confirmed: session.id === match.player2Id,
            player1ConfirmedAt: session.id === match.player1Id ? new Date() : null,
            player2ConfirmedAt: session.id === match.player2Id ? new Date() : null,
            isConfirmed: false,
          },
          update: {
            isConfirmed: false,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      match: updatedMatch,
      frameNumber: nextFrameNumber,
      hasReachedTarget,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
