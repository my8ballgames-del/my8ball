import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { calculateMatchElo, getDivision } from "@/lib/elo";

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

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        player1: { include: { profile: true, availability: true } },
        player2: { include: { profile: true, availability: true } },
        confirmation: true,
        league: true,
        tournament: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.status === "COMPLETED") {
      return NextResponse.json({ error: "Match is already confirmed and completed." }, { status: 400 });
    }

    const isPlayer1 = session.id === match.player1Id;
    const isPlayer2 = session.id === match.player2Id;
    const isOfficial = ["SUPER_ADMIN", "REFEREE", "ORGANIZER"].includes(session.role);

    if (!isPlayer1 && !isPlayer2 && !isOfficial) {
      return NextResponse.json(
        { error: "Only match participants or authorized officials can confirm results." },
        { status: 403 }
      );
    }

    const p1Confirmed = isPlayer1 || (match.confirmation?.player1Confirmed ?? false);
    const p2Confirmed = isPlayer2 || (match.confirmation?.player2Confirmed ?? false);

    // If both confirmed OR verified by official
    const fullyConfirmed = (p1Confirmed && p2Confirmed) || isOfficial;

    if (!fullyConfirmed) {
      // Just record this player's confirmation
      await prisma.matchConfirmation.upsert({
        where: { matchId: match.id },
        update: {
          player1Confirmed: p1Confirmed,
          player2Confirmed: p2Confirmed,
          ...(isPlayer1 && { player1ConfirmedAt: new Date() }),
          ...(isPlayer2 && { player2ConfirmedAt: new Date() }),
        },
        create: {
          matchId: match.id,
          player1Confirmed: isPlayer1,
          player2Confirmed: isPlayer2,
          player1ConfirmedAt: isPlayer1 ? new Date() : null,
          player2ConfirmedAt: isPlayer2 ? new Date() : null,
          isConfirmed: false,
        },
      });

      return NextResponse.json({
        success: true,
        fullyConfirmed: false,
        message: "Your confirmation was recorded. Waiting for opponent to confirm.",
      });
    }

    // Both players confirmed! Run full atomic transaction to update ratings and stats
    const winnerId =
      match.scorePlayer1 > match.scorePlayer2
        ? match.player1Id
        : match.player2Id;

    const p1Profile = match.player1.profile!;
    const p2Profile = match.player2.profile!;

    // Elo rating calculation
    const eloResult = calculateMatchElo(
      p1Profile.rating,
      p2Profile.rating,
      match.scorePlayer1,
      match.scorePlayer2,
      p1Profile.matchesPlayed,
      p2Profile.matchesPlayed
    );

    await prisma.$transaction(async (tx) => {
      // 1. Update Match record
      await tx.match.update({
        where: { id: match.id },
        data: {
          status: "COMPLETED",
          winnerId,
          endedAt: match.endedAt || new Date(),
        },
      });

      // 2. Update Match Confirmation
      await tx.matchConfirmation.upsert({
        where: { matchId: match.id },
        update: {
          player1Confirmed: true,
          player2Confirmed: true,
          isConfirmed: true,
          player1ConfirmedAt: new Date(),
          player2ConfirmedAt: new Date(),
        },
        create: {
          matchId: match.id,
          player1Confirmed: true,
          player2Confirmed: true,
          isConfirmed: true,
          player1ConfirmedAt: new Date(),
          player2ConfirmedAt: new Date(),
        },
      });

      // 3. Create Rating History ledgers
      await tx.ratingHistory.createMany({
        data: [
          {
            userId: match.player1Id,
            matchId: match.id,
            oldRating: p1Profile.rating,
            newRating: eloResult.player1NewRating,
            change: eloResult.player1Change,
            opponentId: match.player2Id,
            opponentRating: p2Profile.rating,
          },
          {
            userId: match.player2Id,
            matchId: match.id,
            oldRating: p2Profile.rating,
            newRating: eloResult.player2NewRating,
            change: eloResult.player2Change,
            opponentId: match.player1Id,
            opponentRating: p1Profile.rating,
          },
        ],
      });

      // 4. Update Player 1 Profile
      const p1Won = winnerId === match.player1Id;
      const p1NewStreak = p1Won ? p1Profile.currentStreak + 1 : 0;
      await tx.profile.update({
        where: { userId: match.player1Id },
        data: {
          rating: eloResult.player1NewRating,
          peakRating: Math.max(p1Profile.peakRating, eloResult.player1NewRating),
          division: getDivision(eloResult.player1NewRating),
          matchesPlayed: p1Profile.matchesPlayed + 1,
          matchesWon: p1Profile.matchesWon + (p1Won ? 1 : 0),
          matchesLost: p1Profile.matchesLost + (p1Won ? 0 : 1),
          framesWon: p1Profile.framesWon + match.scorePlayer1,
          framesLost: p1Profile.framesLost + match.scorePlayer2,
          currentStreak: p1NewStreak,
          bestStreak: Math.max(p1Profile.bestStreak, p1NewStreak),
        },
      });

      // 5. Update Player 2 Profile
      const p2Won = winnerId === match.player2Id;
      const p2NewStreak = p2Won ? p2Profile.currentStreak + 1 : 0;
      await tx.profile.update({
        where: { userId: match.player2Id },
        data: {
          rating: eloResult.player2NewRating,
          peakRating: Math.max(p2Profile.peakRating, eloResult.player2NewRating),
          division: getDivision(eloResult.player2NewRating),
          matchesPlayed: p2Profile.matchesPlayed + 1,
          matchesWon: p2Profile.matchesWon + (p2Won ? 1 : 0),
          matchesLost: p2Profile.matchesLost + (p2Won ? 0 : 1),
          framesWon: p2Profile.framesWon + match.scorePlayer2,
          framesLost: p2Profile.framesLost + match.scorePlayer1,
          currentStreak: p2NewStreak,
          bestStreak: Math.max(p2Profile.bestStreak, p2NewStreak),
        },
      });

      // 6. Release Player Availability from IN_MATCH
      await tx.userAvailability.update({
        where: { userId: match.player1Id },
        data: { status: "AVAILABLE_INDIVIDUAL", isAvailable: true, activeMatchId: null },
      });
      await tx.userAvailability.update({
        where: { userId: match.player2Id },
        data: { status: "AVAILABLE_INDIVIDUAL", isAvailable: true, activeMatchId: null },
      });

      // 7. Check & unlock badges for the winner
      const winCount = (winnerId === match.player1Id ? p1Profile.matchesWon : p2Profile.matchesWon) + 1;
      if (winCount === 1) {
        const firstWinBadge = await tx.achievement.findUnique({ where: { code: "FIRST_VICTORY" } });
        if (firstWinBadge) {
          await tx.userAchievement.upsert({
            where: { userId_achievementId: { userId: winnerId, achievementId: firstWinBadge.id } },
            update: {},
            create: { userId: winnerId, achievementId: firstWinBadge.id, matchId: match.id },
          });
        }
      }

      // Check clean sweep (shutout: opponent 0 frames)
      const loserScore = winnerId === match.player1Id ? match.scorePlayer2 : match.scorePlayer1;
      if (loserScore === 0 && match.raceTo >= 5) {
        const cleanSweepBadge = await tx.achievement.findUnique({ where: { code: "CLEAN_SWEEP" } });
        if (cleanSweepBadge) {
          await tx.userAchievement.upsert({
            where: { userId_achievementId: { userId: winnerId, achievementId: cleanSweepBadge.id } },
            update: {},
            create: { userId: winnerId, achievementId: cleanSweepBadge.id, matchId: match.id },
          });
        }
      }

      // 8. Update Fixture if linked
      await tx.fixture.updateMany({
        where: { matchId: match.id },
        data: {
          status: "COMPLETED",
          score1: match.scorePlayer1,
          score2: match.scorePlayer2,
          winnerId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      fullyConfirmed: true,
      winnerId,
      eloResult,
      message: "Match result confirmed! Official Elo ratings updated.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
