import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "my8ball_super_secret_production_key_2026_blackball"
);

const COOKIE_NAME = "my8ball_session";

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  username: string;
  displayName: string;
}

export async function createSessionToken(user: {
  id: string;
  email: string;
  role: string;
  username: string;
  displayName: string;
}) {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    username: user.username,
    displayName: user.displayName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function getCurrentFullUser() {
  const session = await getSessionUser();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      profile: true,
      availability: true,
      privacy: true,
      teamMemberships: {
        include: {
          team: true,
        },
      },
    },
  });

  return user;
}

export { COOKIE_NAME };
