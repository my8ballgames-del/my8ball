import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const town = searchParams.get("town");

    const where: any = {};
    if (town && town !== "all") {
      where.town = town;
    }

    const teams = await prisma.team.findMany({
      where,
      include: {
        captain: { include: { profile: true } },
        members: {
          include: {
            user: { include: { profile: true } },
          },
        },
      },
      orderBy: [{ rating: "desc" }, { wins: "desc" }],
    });

    const formatted = teams.map((t, idx) => ({
      id: t.id,
      rank: idx + 1,
      name: t.name,
      slug: t.slug,
      emblemUrl: t.emblemUrl || "/assets/my8ball_logo.jpg",
      town: t.town,
      homeVenue: t.homeVenue,
      rating: Math.round(t.rating),
      division: t.division,
      wins: t.wins,
      losses: t.losses,
      draws: t.draws,
      description: t.description,
      captain: {
        id: t.captain.id,
        username: t.captain.profile?.username,
        displayName: t.captain.profile?.displayName,
      },
      memberCount: t.members.length,
      members: t.members.map((m) => ({
        id: m.user.id,
        username: m.user.profile?.username,
        displayName: m.user.profile?.displayName,
        role: m.role,
        rating: m.user.profile?.rating ?? 1200,
      })),
    }));

    return NextResponse.json({ teams: formatted });
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

    const { name, town, homeVenue, description } = await req.json();

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Team name must be at least 3 characters." },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.team.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A team with this name or slug already exists." },
        { status: 409 }
      );
    }

    const newTeam = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name: name.trim(),
          slug,
          town: town?.trim() || "Mpheni",
          homeVenue: homeVenue?.trim() || "Local Pool Hall",
          description: description?.trim() || "Competitive 8-ball squad",
          captainId: session.id,
          rating: 1200.0,
          division: "BRONZE",
          emblemUrl: "/assets/my8ball_logo.jpg",
        },
      });

      // Add captain as member
      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: session.id,
          role: "CAPTAIN",
        },
      });

      // Award Squad Leader achievement
      const captainBadge = await tx.achievement.findUnique({
        where: { code: "TEAM_CAPTAIN" },
      });
      if (captainBadge) {
        await tx.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: session.id,
              achievementId: captainBadge.id,
            },
          },
          update: {},
          create: {
            userId: session.id,
            achievementId: captainBadge.id,
          },
        });
      }

      return team;
    });

    return NextResponse.json({ success: true, team: newTeam });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
