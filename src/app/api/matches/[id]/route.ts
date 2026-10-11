import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        player1: {
          include: { profile: true, availability: true },
        },
        player2: {
          include: { profile: true, availability: true },
        },
        team1: true,
        team2: true,
        tournament: true,
        league: true,
        confirmation: true,
        disputes: {
          include: {
            raisedBy: { include: { profile: true } },
          },
        },
        ratingHistories: true,
        frames: {
          orderBy: { frameNumber: "asc" },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ match });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
