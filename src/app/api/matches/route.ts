import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const userId = searchParams.get("userId");
    const tournamentId = searchParams.get("tournamentId");
    const leagueId = searchParams.get("leagueId");

    const where: any = {};

    if (status) {
      if (status === "LIVE") {
        where.status = "IN_PROGRESS";
      } else if (status === "AWAITING") {
        where.status = "AWAITING_CONFIRMATION";
      } else {
        where.status = status;
      }
    }

    if (type) {
      where.type = type;
    }

    if (tournamentId) {
      where.tournamentId = tournamentId;
    }

    if (leagueId) {
      where.leagueId = leagueId;
    }

    if (userId) {
      where.OR = [{ player1Id: userId }, { player2Id: userId }];
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        player1: { include: { profile: true } },
        player2: { include: { profile: true } },
        team1: true,
        team2: true,
        tournament: true,
        league: true,
        confirmation: true,
        frames: {
          orderBy: { frameNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    return NextResponse.json({ matches });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
