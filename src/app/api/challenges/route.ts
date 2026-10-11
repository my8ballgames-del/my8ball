import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [received, sent] = await Promise.all([
      prisma.challenge.findMany({
        where: { challengedId: session.id },
        include: {
          challenger: {
            include: { profile: true, availability: true },
          },
          match: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.challenge.findMany({
        where: { challengerId: session.id },
        include: {
          challenged: {
            include: { profile: true, availability: true },
          },
          match: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ received, sent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      challengedId,
      type = "INDIVIDUAL",
      ruleset = "BLACKBALL_SA",
      raceTo = 5,
      isPlayNow = true,
      scheduledTime,
      venue,
      message,
    } = await req.json();

    if (!challengedId) {
      return NextResponse.json({ error: "Opponent is required" }, { status: 400 });
    }

    if (challengedId === session.id) {
      return NextResponse.json({ error: "You cannot challenge yourself" }, { status: 400 });
    }

    // Verify challenged user exists and is not suspended
    const opponent = await prisma.user.findUnique({
      where: { id: challengedId },
      include: { availability: true, profile: true },
    });

    if (!opponent || opponent.isSuspended) {
      return NextResponse.json(
        { error: "Opponent is unavailable or does not exist" },
        { status: 404 }
      );
    }

    // Check if opponent is currently locked in an active match
    const opponentActiveMatch = await prisma.match.findFirst({
      where: {
        OR: [{ player1Id: challengedId }, { player2Id: challengedId }],
        status: "IN_PROGRESS",
      },
    });

    if (opponentActiveMatch) {
      return NextResponse.json(
        {
          error: `${opponent.profile?.displayName || "Player"} is currently competing in an active match. Please wait until their frame concludes.`,
        },
        { status: 409 }
      );
    }

    // Check if challenger is currently in an active match
    const challengerActiveMatch = await prisma.match.findFirst({
      where: {
        OR: [{ player1Id: session.id }, { player2Id: session.id }],
        status: "IN_PROGRESS",
      },
    });

    if (challengerActiveMatch) {
      return NextResponse.json(
        {
          error: "You have an ongoing match in progress. Finish your active match before challenging another player.",
        },
        { status: 409 }
      );
    }

    // Check for existing pending challenge between these two players
    const existingPending = await prisma.challenge.findFirst({
      where: {
        OR: [
          { challengerId: session.id, challengedId, status: "PENDING" },
          { challengerId: challengedId, challengedId: session.id, status: "PENDING" },
        ],
      },
    });

    if (existingPending) {
      return NextResponse.json(
        {
          error: "An active pending challenge already exists between you and this player.",
        },
        { status: 409 }
      );
    }

    // Create challenge expiring in 2 hours for play-now or 24 hours for scheduled
    const expiresAt = isPlayNow
      ? new Date(Date.now() + 2 * 60 * 60 * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const challenge = await prisma.challenge.create({
      data: {
        challengerId: session.id,
        challengedId,
        type,
        ruleset,
        raceTo: parseInt(raceTo) || 5,
        isPlayNow,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        venue: venue || opponent.availability?.preferredVenue || "Community Pool Hall",
        message: message || "Let's play!",
        status: "PENDING",
        expiresAt,
      },
      include: {
        challenger: { include: { profile: true } },
        challenged: { include: { profile: true } },
      },
    });

    // Send in-app notification to challenged player
    await prisma.notification.create({
      data: {
        userId: challengedId,
        type: "CHALLENGE_RECEIVED",
        title: `Challenge from ${challenge.challenger.profile?.displayName}`,
        message: `${challenge.challenger.profile?.displayName} challenged you to a Race-to-${challenge.raceTo} under ${challenge.ruleset.replace("_", " ")} rules.`,
        link: "/challenges",
      },
    });

    return NextResponse.json({ success: true, challenge });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
