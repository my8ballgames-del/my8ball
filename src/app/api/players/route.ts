import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase();
    const town = searchParams.get("town");
    const province = searchParams.get("province");
    const availableOnly = searchParams.get("available") === "true";
    const skillLevel = searchParams.get("skill");
    const ruleset = searchParams.get("ruleset");
    const minRating = searchParams.get("minRating");
    const maxRating = searchParams.get("maxRating");

    const where: any = {
      isSuspended: false,
      privacy: {
        profileVisibility: { in: ["PUBLIC", "REGISTERED_ONLY"] },
      },
    };

    if (query) {
      where.OR = [
        { profile: { displayName: { contains: query } } },
        { profile: { username: { contains: query } } },
        { profile: { club: { contains: query } } },
      ];
    }

    if (town && town !== "all") {
      where.profile = { ...where.profile, town };
    }

    if (province && province !== "all") {
      where.profile = { ...where.profile, province };
    }

    if (skillLevel && skillLevel !== "all") {
      where.profile = { ...where.profile, skillLevel };
    }

    if (ruleset && ruleset !== "all") {
      where.profile = { ...where.profile, preferredRuleSet: ruleset };
    }

    if (minRating || maxRating) {
      where.profile = {
        ...where.profile,
        rating: {
          ...(minRating && { gte: parseFloat(minRating) }),
          ...(maxRating && { lte: parseFloat(maxRating) }),
        },
      };
    }

    if (availableOnly) {
      where.availability = {
        isAvailable: true,
        status: { in: ["AVAILABLE_INDIVIDUAL", "AVAILABLE_TEAM", "AVAILABLE_BOTH"] },
      };
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        profile: true,
        availability: true,
        teamMemberships: {
          include: {
            team: true,
          },
        },
      },
      orderBy: [
        { availability: { isAvailable: "desc" } },
        { profile: { rating: "desc" } },
      ],
      take: 50,
    });

    const formatted = users.map((u) => ({
      id: u.id,
      username: u.profile?.username,
      displayName: u.profile?.displayName,
      avatarUrl: u.profile?.avatarUrl,
      town: u.profile?.town,
      province: u.profile?.province,
      club: u.profile?.club,
      skillLevel: u.profile?.skillLevel,
      rating: u.profile?.rating ?? 1200,
      division: u.profile?.division ?? "BRONZE",
      matchesPlayed: u.profile?.matchesPlayed ?? 0,
      matchesWon: u.profile?.matchesWon ?? 0,
      winRate:
        u.profile?.matchesPlayed && u.profile.matchesPlayed > 0
          ? Math.round((u.profile.matchesWon / u.profile.matchesPlayed) * 100)
          : 0,
      streak: u.profile?.currentStreak ?? 0,
      status: u.availability?.status ?? "OFFLINE",
      isAvailable: u.availability?.isAvailable ?? false,
      preferredRuleSet: u.availability?.preferredRuleSet ?? "BLACKBALL_SA",
      preferredVenue: u.availability?.preferredVenue ?? u.profile?.club,
      primaryTeam: u.teamMemberships?.[0]?.team?.name ?? null,
    }));

    return NextResponse.json({ players: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
