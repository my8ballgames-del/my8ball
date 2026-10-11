import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !["SUPER_ADMIN", "MODERATOR", "ORGANIZER"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const [
      totalUsers,
      availablePlayers,
      liveMatches,
      completedMatches,
      openDisputes,
      totalTeams,
      activeLeagues,
      totalTournaments,
      disputesList,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.userAvailability.count({ where: { isAvailable: true } }),
      prisma.match.count({ where: { status: "IN_PROGRESS" } }),
      prisma.match.count({ where: { status: "COMPLETED" } }),
      prisma.dispute.count({ where: { status: "OPEN" } }),
      prisma.team.count(),
      prisma.league.count({ where: { status: "ACTIVE" } }),
      prisma.tournament.count(),
      prisma.dispute.findMany({
        include: {
          match: {
            include: {
              player1: { include: { profile: true } },
              player2: { include: { profile: true } },
            },
          },
          raisedBy: { include: { profile: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.user.findMany({
        include: { profile: true, availability: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalUsers,
        availablePlayers,
        liveMatches,
        completedMatches,
        openDisputes,
        totalTeams,
        activeLeagues,
        totalTournaments,
      },
      disputes: disputesList,
      users: recentUsers,
      featureFlags: {
        WALLETS_AND_MONETARY_STAKES: false, // Architectural boundary - Section 20
        BLACKBALL_RULES_STRICT_MODE: true,
        LIVE_SCOREBOARD_SSE: true,
        COMMUNITY_LEAGUES_ACTIVE: true,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action, userId, disputeId, resolutionNotes } = await req.json();

    if (action === "TOGGLE_SUSPEND_USER" && userId) {
      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isSuspended: !target.isSuspended },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.id,
          action: target.isSuspended ? "REINSTATE_USER" : "SUSPEND_USER",
          entityType: "USER",
          entityId: userId,
          details: `Admin changed suspension status to ${!target.isSuspended}`,
        },
      });

      return NextResponse.json({ success: true, isSuspended: updated.isSuspended });
    }

    if (action === "RESOLVE_DISPUTE" && disputeId) {
      const dispute = await prisma.dispute.update({
        where: { id: disputeId },
        data: {
          status: "RESOLVED",
          resolvedById: session.id,
          resolutionNotes: resolutionNotes || "Reviewed and resolved by platform administrator.",
        },
        include: { match: true },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.id,
          action: "RESOLVE_DISPUTE",
          entityType: "DISPUTE",
          entityId: disputeId,
          details: resolutionNotes || "Dispute resolved",
        },
      });

      return NextResponse.json({ success: true, dispute });
    }

    return NextResponse.json({ error: "Invalid admin action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
