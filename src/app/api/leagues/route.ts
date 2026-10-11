import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const leagues = await prisma.league.findMany({
      where,
      include: {
        organizer: { include: { profile: true } },
        participants: {
          include: {
            team: true,
            user: { include: { profile: true } },
          },
          orderBy: [{ points: "desc" }, { wins: "desc" }],
        },
        fixtures: {
          take: 6,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leagues });
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
      name,
      description,
      location,
      competitionType = "TEAM",
      ruleset = "BLACKBALL_SA",
      format = "ROUND_ROBIN",
      raceTo = 5,
      pointsWin = 3,
      pointsDraw = 1,
      pointsLoss = 0,
    } = await req.json();

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: "League name must be at least 3 characters." },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.league.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A league with this name already exists." },
        { status: 409 }
      );
    }

    const league = await prisma.league.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || "Community Pool League",
        location: location?.trim() || "Mpheni Community",
        organizerId: session.id,
        competitionType,
        ruleset,
        format,
        raceTo: parseInt(raceTo) || 5,
        pointsWin: parseInt(pointsWin) || 3,
        pointsDraw: parseInt(pointsDraw) || 1,
        pointsLoss: parseInt(pointsLoss) || 0,
        status: "ACTIVE",
        edition: 1,
        emblemUrl: "/assets/tournament_arena.jpg",
      },
    });

    return NextResponse.json({ success: true, league });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
