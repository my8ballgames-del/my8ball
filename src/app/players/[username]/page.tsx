import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Trophy,
  Swords,
  MapPin,
  Shield,
  Flame,
  Award,
  CheckCircle2,
  Calendar,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getDivisionColor } from "@/lib/elo";

export const revalidate = 0;

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const profile = await prisma.profile.findUnique({
    where: { username },
    include: {
      user: {
        include: {
          availability: true,
          achievements: {
            include: { achievement: true },
            orderBy: { awardedAt: "desc" },
          },
          teamMemberships: {
            include: { team: true },
          },
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  // Fetch recent completed matches for this player
  const recentMatches = await prisma.match.findMany({
    where: {
      OR: [{ player1Id: profile.userId }, { player2Id: profile.userId }],
      status: "COMPLETED",
    },
    include: {
      player1: { include: { profile: true } },
      player2: { include: { profile: true } },
    },
    orderBy: { endedAt: "desc" },
    take: 6,
  });

  const divisionColor = getDivisionColor(profile.division);
  const winRate =
    profile.matchesPlayed > 0
      ? Math.round((profile.matchesWon / profile.matchesPlayed) * 100)
      : 0;
  const isAvailable = profile.user.availability?.isAvailable ?? false;
  const isPlaying = profile.user.availability?.status === "IN_MATCH";

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Player Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-surface-border bg-surface-card p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-surface-elevated border-2 border-brand/40 flex items-center justify-center font-black text-3xl text-white shadow-glow">
              {profile.displayName[0]}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${divisionColor.bg} ${divisionColor.text} ${divisionColor.border}`}
                >
                  {profile.division} DIVISION
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-muted">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.town}, {profile.province}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {profile.displayName}
              </h1>
              <p className="text-xs text-slate-muted font-mono">
                @{profile.username} · {profile.club}
              </p>
            </div>
          </div>

          {/* Quick Challenge CTA */}
          <div className="flex items-center gap-3">
            <Link
              href={`/players?challenge=${profile.userId}`}
              className="px-6 py-3 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow flex items-center gap-2 transition-all hover:scale-105"
            >
              <Swords className="w-4 h-4" />
              <span>Challenge to Match</span>
            </Link>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-6 pt-4 border-t border-surface-border/60 text-xs text-slate-muted italic max-w-2xl leading-relaxed">
            &quot;{profile.bio}&quot;
          </p>
        )}
      </div>

      {/* Career Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-muted block mb-1">
            Official Elo
          </span>
          <span className="font-mono text-2xl font-black text-brand">
            {Math.round(profile.rating)}
          </span>
          <span className="text-[10px] text-slate-muted block mt-1">
            Peak: {Math.round(profile.peakRating)} ELO
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-muted block mb-1">
            Win Percentage
          </span>
          <span className="font-mono text-2xl font-black text-white">
            {winRate}%
          </span>
          <span className="text-[10px] text-slate-muted block mt-1">
            {profile.matchesWon} Won / {profile.matchesLost} Lost
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-muted block mb-1">
            Frames Record
          </span>
          <span className="font-mono text-2xl font-black text-white">
            {profile.framesWon} - {profile.framesLost}
          </span>
          <span className="text-[10px] text-slate-muted block mt-1">
            Diff: {profile.framesWon - profile.framesLost >= 0 ? "+" : ""}
            {profile.framesWon - profile.framesLost}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-muted block mb-1">
            Winning Streak
          </span>
          <span className="font-mono text-2xl font-black text-gold flex items-center gap-1.5">
            <Flame className="w-5 h-5 fill-gold text-gold" />
            {profile.currentStreak}
          </span>
          <span className="text-[10px] text-slate-muted block mt-1">
            Career Best: {profile.bestStreak}
          </span>
        </div>
      </div>

      {/* Trophy Cabinet (Achievements) */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            <span>Trophy Cabinet &amp; Badges</span>
          </h2>
          <span className="text-xs font-mono text-gold">
            {profile.user.achievements.length} Unlocked
          </span>
        </div>

        {profile.user.achievements.length === 0 ? (
          <p className="text-xs text-slate-muted py-6 text-center">
            No achievements unlocked yet. Play competitive matches to fill your trophy cabinet!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profile.user.achievements.map((ua) => (
              <div
                key={ua.id}
                className="p-4 rounded-xl bg-surface border border-surface-border hover:border-gold/40 transition-all flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {ua.achievement.title}
                  </h4>
                  <p className="text-[11px] text-slate-muted leading-tight mt-0.5">
                    {ua.achievement.description}
                  </p>
                  <span className="text-[9px] uppercase font-bold text-gold/80 block mt-1">
                    {ua.achievement.rarity} · +{ua.achievement.points} PTS
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Match History */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-base font-bold font-display text-white">
          Recent Official Match History
        </h2>

        {recentMatches.length === 0 ? (
          <p className="text-xs text-slate-muted py-6 text-center">
            No completed matches on record yet.
          </p>
        ) : (
          <div className="space-y-3">
            {recentMatches.map((m) => {
              const isP1 = m.player1Id === profile.userId;
              const myScore = isP1 ? m.scorePlayer1 : m.scorePlayer2;
              const oppScore = isP1 ? m.scorePlayer2 : m.scorePlayer1;
              const opponent = isP1 ? m.player2 : m.player1;
              const won = m.winnerId === profile.userId;

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-xl bg-surface border border-surface-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-md font-mono font-black text-xs ${
                        won
                          ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                          : "bg-red-950/60 text-red-300 border border-red-500/40"
                      }`}
                    >
                      {won ? "WIN" : "LOSS"} {myScore} - {oppScore}
                    </span>
                    <div>
                      <p className="font-bold text-white">
                        vs {opponent.profile?.displayName}
                      </p>
                      <p className="text-[11px] text-slate-muted">
                        Race to {m.raceTo} · {m.ruleset.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/matches/${m.id}`}
                    className="text-xs font-bold text-brand hover:underline flex items-center gap-1 self-end sm:self-auto"
                  >
                    <span>View Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
