import { NextResponse } from "next/server";
import { getCurrentFullUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentFullUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.profile?.username,
        displayName: user.profile?.displayName,
        profile: user.profile,
        availability: user.availability,
        privacy: user.privacy,
        teams: user.teamMemberships.map((tm) => tm.team),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
