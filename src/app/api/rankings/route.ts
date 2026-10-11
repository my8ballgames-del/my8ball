import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "all";
    const province = searchParams.get("province");
    const town = searchParams.get("town");
    const division = searchParams.get("division");
    const ruleset = searchParams.get("ruleset");

    const where: any = {
      user: {
        isSuspended: false,
      },
    };

    if (town && town !== "all") {
      where.town = town;
    }

    if (province && province !== "all") {
      where.province = province;
    }

    if (division && division !== "all") {
      where.division = division;
    }

    if (ruleset && ruleset !== "all") {
      where.preferredRuleSet = ruleset;
    }

    const profiles = await prisma.profile.findMany({
      where,
      include: {
        user: {
          include: {
            availability: true,
            teamMemberships: {
              include: { team: true },
            },
          },
        },
      },
      orderBy: [
        { rating: "desc" },
        { matchesWon: "desc" },
        { framesWon: "desc" },
      ],
      take: 100,
    });

    const ranked = profiles.map((p, idx) => ({
      rank: idx + 1,
      id: p.userId,
      username: p.username,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      town: p.town,
      province: p.province,
      club: p.club,
      rating: Math.round(p.rating),
      peakRating: Math.round(p.peakRating),
      division: p.division,
      matchesPlayed: p.matchesPlayed,
      matchesWon: p.matchesWon,
      matchesLost: p.matchesLost,
      winRate:
        p.matchesPlayed > 0
          ? Math.round((p.matchesWon / p.matchesPlayed) * 100)
          : 0,
      framesWon: p.framesWon,
      framesLost: p.framesLost,
      frameDifferential: p.framesWon - p.framesLost,
      streak: p.currentStreak,
      bestStreak: p.bestStreak,
      isAvailable: p.user.availability?.isAvailable ?? false,
      status: p.user.availability?.status ?? "OFFLINE",
      teamName: p.user.teamMemberships?.[0]?.team?.name ?? null,
    }));

    return NextResponse.json({ rankings: ranked });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
