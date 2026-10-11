import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      username,
      displayName,
      town,
      province,
      club,
      skillLevel,
      preferredRuleSet,
    } = await req.json();

    if (!email || !password || !username || !displayName) {
      return NextResponse.json(
        { error: "Email, password, username, and display name are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 alphanumeric characters or underscores." },
        { status: 400 }
      );
    }

    // Check uniqueness
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const existingUser = await prisma.profile.findUnique({
      where: { username: cleanUsername },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "This username is already taken. Please choose another." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create User, Profile, UserAvailability, UserPrivacy in transaction
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "PLAYER",
        isVerified: true,
        profile: {
          create: {
            username: cleanUsername,
            displayName: displayName.trim(),
            country: "South Africa",
            town: town?.trim() || "Mpheni",
            province: province?.trim() || "Limpopo",
            club: club?.trim() || "Local Pool Club",
            skillLevel: skillLevel || "BEGINNER",
            preferredRuleSet: preferredRuleSet || "BLACKBALL_SA",
            rating: 1200.0,
            peakRating: 1200.0,
            division: "BRONZE",
            provisionalMatches: 0,
          },
        },
        availability: {
          create: {
            status: "AVAILABLE_INDIVIDUAL",
            isAvailable: true,
            availableForIndividual: true,
            availableForTeam: false,
            preferredRuleSet: preferredRuleSet || "BLACKBALL_SA",
            preferredVenue: club?.trim() || "Local Pool Club",
          },
        },
        privacy: {
          create: {
            locationVisibility: "TOWN",
            profileVisibility: "PUBLIC",
            allowChallenges: true,
            showStats: true,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Award First Break achievement when created
    const firstBreakBadge = await prisma.achievement.findUnique({
      where: { code: "FIRST_BREAK" },
    });
    if (firstBreakBadge) {
      await prisma.userAchievement.create({
        data: {
          userId: newUser.id,
          achievementId: firstBreakBadge.id,
        },
      });
    }

    // Generate Session Token & set cookie
    const token = await createSessionToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      username: newUser.profile!.username,
      displayName: newUser.profile!.displayName,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        username: newUser.profile?.username,
        displayName: newUser.profile?.displayName,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
