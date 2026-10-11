import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return NextResponse.redirect(new URL("/auth/sign-in", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
