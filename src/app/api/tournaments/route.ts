import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const tournaments = await prisma.tournament.findMany({
      where,
      include: {
        organizer: { include: { profile: true } },
        league: true,
        registrations: {
          include: {
            team: true,
            user: { include: { profile: true } },
          },
          orderBy: { seed: "asc" },
        },
        fixtures: {
          orderBy: [{ round: "asc" }, { tableNumber: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tournaments });
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
      location,
      venue,
      ruleset = "BLACKBALL_SA",
      format = "GROUP_KNOCKOUT",
      type = "TEAM",
      raceTo = 5,
      numTables = 3,
      maxParticipants = 8,
      leagueId,
    } = await req.json();

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Tournament name must be at least 3 characters." },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.tournament.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A tournament with this name already exists." },
        { status: 409 }
      );
    }

    const tournament = await prisma.tournament.create({
      data: {
        name: name.trim(),
        slug,
        organizerId: session.id,
        leagueId: leagueId || null,
        location: location?.trim() || "Mpheni Community Hall",
        venue: venue?.trim() || "Mpheni Legends Club Arena",
        ruleset,
        format,
        type,
        raceTo: parseInt(raceTo) || 5,
        numTables: parseInt(numTables) || 3,
        maxParticipants: parseInt(maxParticipants) || 8,
        status: "REGISTRATION",
        posterUrl: "/assets/tournament_arena.jpg",
      },
    });

    return NextResponse.json({ success: true, tournament });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
