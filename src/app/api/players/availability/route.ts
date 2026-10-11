import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, availableForIndividual, availableForTeam, preferredVenue, preferredRuleSet } =
      await req.json();

    // Check if user is currently locked in an active match
    const activeMatch = await prisma.match.findFirst({
      where: {
        OR: [{ player1Id: session.id }, { player2Id: session.id }],
        status: "IN_PROGRESS",
      },
    });

    if (activeMatch && status === "AVAILABLE_INDIVIDUAL") {
      return NextResponse.json(
        {
          error: "You are currently playing an active match. Finish or confirm the match before enabling open availability.",
        },
        { status: 400 }
      );
    }

    const isAvailable =
      status === "AVAILABLE_INDIVIDUAL" ||
      status === "AVAILABLE_TEAM" ||
      status === "AVAILABLE_BOTH";

    const updated = await prisma.userAvailability.upsert({
      where: { userId: session.id },
      update: {
        status: status || (isAvailable ? "AVAILABLE_INDIVIDUAL" : "ONLINE_UNAVAILABLE"),
        isAvailable,
        ...(availableForIndividual !== undefined && { availableForIndividual }),
        ...(availableForTeam !== undefined && { availableForTeam }),
        ...(preferredVenue && { preferredVenue }),
        ...(preferredRuleSet && { preferredRuleSet }),
        activeMatchId: activeMatch ? activeMatch.id : null,
      },
      create: {
        userId: session.id,
        status: status || "AVAILABLE_INDIVIDUAL",
        isAvailable,
        availableForIndividual: availableForIndividual ?? true,
        availableForTeam: availableForTeam ?? false,
        preferredVenue: preferredVenue || "Local Club",
        preferredRuleSet: preferredRuleSet || "BLACKBALL_SA",
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
