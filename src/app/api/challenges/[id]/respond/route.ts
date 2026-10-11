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
    const { action } = await req.json(); // ACCEPT, DECLINE, CANCEL

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        challenger: { include: { profile: true } },
        challenged: { include: { profile: true } },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    if (challenge.status !== "PENDING") {
      return NextResponse.json(
        { error: `Challenge is already ${challenge.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Cancellation check: only challenger can cancel
    if (action === "CANCEL") {
      if (challenge.challengerId !== session.id) {
        return NextResponse.json(
          { error: "Only the challenger can cancel this challenge" },
          { status: 403 }
        );
      }

      await prisma.challenge.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      return NextResponse.json({ success: true, status: "CANCELLED" });
    }

    // Decline or Accept check: only challenged player can respond
    if (challenge.challengedId !== session.id) {
      return NextResponse.json(
        { error: "You are not the recipient of this challenge" },
        { status: 403 }
      );
    }

    if (action === "DECLINE") {
      await prisma.challenge.update({
        where: { id },
        data: { status: "DECLINED" },
      });

      await prisma.notification.create({
        data: {
          userId: challenge.challengerId,
          type: "CHALLENGE_DECLINED",
          title: "Challenge Declined",
          message: `${challenge.challenged.profile?.displayName} declined your match challenge.`,
          link: "/challenges",
        },
      });

      return NextResponse.json({ success: true, status: "DECLINED" });
    }

    if (action === "ACCEPT") {
      // Concurrency check: Ensure neither player is in an active match
      const [p1Active, p2Active] = await Promise.all([
        prisma.match.findFirst({
          where: {
            OR: [{ player1Id: challenge.challengerId }, { player2Id: challenge.challengerId }],
            status: "IN_PROGRESS",
          },
        }),
        prisma.match.findFirst({
          where: {
            OR: [{ player1Id: challenge.challengedId }, { player2Id: challenge.challengedId }],
            status: "IN_PROGRESS",
          },
        }),
      ]);

      if (p1Active || p2Active) {
        return NextResponse.json(
          {
            error: "One of the players is already participating in an active match. Please wait until they finish.",
          },
          { status: 409 }
        );
      }

      // Transactionally start match & lock players' availability
      const result = await prisma.$transaction(async (tx) => {
        const newMatch = await tx.match.create({
          data: {
            challengeId: challenge.id,
            type: challenge.type,
            ruleset: challenge.ruleset,
            raceTo: challenge.raceTo,
            status: "IN_PROGRESS",
            venue: challenge.venue,
            player1Id: challenge.challengerId,
            player2Id: challenge.challengedId,
            scorePlayer1: 0,
            scorePlayer2: 0,
            startedAt: new Date(),
          },
        });

        await tx.challenge.update({
          where: { id },
          data: {
            status: "IN_PROGRESS",
            matchId: newMatch.id,
          },
        });

        // Set both players to IN_MATCH
        await tx.userAvailability.update({
          where: { userId: challenge.challengerId },
          data: { status: "IN_MATCH", activeMatchId: newMatch.id },
        });

        await tx.userAvailability.update({
          where: { userId: challenge.challengedId },
          data: { status: "IN_MATCH", activeMatchId: newMatch.id },
        });

        return newMatch;
      });

      // Notification
      await prisma.notification.create({
        data: {
          userId: challenge.challengerId,
          type: "CHALLENGE_ACCEPTED",
          title: "Challenge Accepted! Match is LIVE",
          message: `${challenge.challenged.profile?.displayName} accepted your challenge. The match scoreboard is ready!`,
          link: `/matches/${result.id}`,
        },
      });

      return NextResponse.json({ success: true, matchId: result.id });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
