import React from "react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  Swords,
  Trophy,
  Users,
  Radio,
  Flame,
  Award,
  Calendar,
  Shield,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getDivisionColor } from "@/lib/elo";

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSessionUser();

  // If no session, load default featured player Talifhani (Boyka)
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.id },
        include: {
          profile: true,
          availability: true,
          achievements: { include: { achievement: true } },
          teamMemberships: { include: { team: true } },
        },
      })
    : await prisma.user.findFirst({
        where: { profile: { username: "talifhani_boyka" } },
        include: {
          profile: true,
          availability: true,
          achievements: { include: { achievement: true } },
          teamMemberships: { include: { team: true } },
        },
      });

  const profile = user?.profile;
  const availability = user?.availability;

  // Fetch pending challenges for user
  const pendingChallenges = user
    ? await prisma.challenge.findMany({
        where: { challengedId: user.id, status: "PENDING" },
        include: { challenger: { include: { profile: true } } },
      })
    : [];

  // Fetch match awaiting confirmation
  const awaitingConfirmationMatch = user
    ? await prisma.match.findFirst({
        where: {
          OR: [{ player1Id: user.id }, { player2Id: user.id }],
          status: "AWAITING_CONFIRMATION",
        },
        include: {
          player1: { include: { profile: true } },
          player2: { include: { profile: true } },
          confirmation: true,
        },
      })
    : null;

  // Fetch active live matches across platform
  const liveMatches = await prisma.match.findMany({
    where: { status: "IN_PROGRESS" },
    include: {
      player1: { include: { profile: true } },
      player2: { include: { profile: true } },
      team1: true,
      team2: true,
    },
    take: 3,
  });

  // Fetch other available players in community
  const availableOpponents = await prisma.user.findMany({
    where: {
      id: { not: user?.id },
      availability: {
        isAvailable: true,
        status: { in: ["AVAILABLE_INDIVIDUAL", "AVAILABLE_BOTH"] },
      },
    },
    include: { profile: true, availability: true },
    take: 4,
  });

  const divisionColor = getDivisionColor(profile?.division || "BRONZE");

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Card */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-surface-border bg-surface-card p-4 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-3.5 sm:gap-5">
            <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-surface-elevated border-2 border-brand/40 flex items-center justify-center font-extrabold text-xl sm:text-2xl text-white shadow-glow shrink-0">
              {profile?.displayName?.[0] || "P"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${divisionColor.bg} ${divisionColor.text} ${divisionColor.border}`}
                >
                  {profile?.division || "BRONZE"} DIVISION
                </span>
                <span className="text-xs text-slate-muted flex items-center gap-1 whitespace-nowrap">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile?.town}, {profile?.province}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold font-display text-white truncate">
                {profile?.displayName}
              </h1>
              <p className="text-xs text-slate-muted font-mono truncate">
                @{profile?.username} · {profile?.club}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center justify-around sm:justify-start gap-1 sm:gap-4 bg-surface p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-surface-border w-full md:w-auto">
            <div className="px-2 sm:px-3 text-center sm:text-left border-r border-surface-border">
              <span className="text-[9px] sm:text-[10px] text-slate-muted uppercase font-semibold block whitespace-nowrap">
                Elo Rating
              </span>
              <span className="font-mono text-lg sm:text-2xl font-black text-brand whitespace-nowrap">
                {Math.round(profile?.rating || 1200)}
              </span>
            </div>
            <div className="px-2 sm:px-3 text-center sm:text-left border-r border-surface-border">
              <span className="text-[9px] sm:text-[10px] text-slate-muted uppercase font-semibold block whitespace-nowrap">
                Win Rate
              </span>
              <span className="font-mono text-lg sm:text-2xl font-black text-white whitespace-nowrap">
                {profile?.matchesPlayed && profile.matchesPlayed > 0
                  ? Math.round((profile.matchesWon / profile.matchesPlayed) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="px-2 sm:px-3 text-center sm:text-left">
              <span className="text-[9px] sm:text-[10px] text-slate-muted uppercase font-semibold block whitespace-nowrap">
                Current Streak
              </span>
              <span className="font-mono text-lg sm:text-2xl font-black text-gold inline-flex items-center gap-1 whitespace-nowrap">
                <Flame className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-gold text-gold" />
                {profile?.currentStreak || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action CTAs */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-surface-border flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Link
            href="/players"
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Swords className="w-4 h-4" />
            <span>Find an Opponent</span>
          </Link>
          <Link
            href="/challenges"
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-white font-semibold text-xs hover:border-brand/40 flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <span>Challenges Inbox</span>
            {pendingChallenges.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-brand text-black font-extrabold text-[10px]">
                {pendingChallenges.length}
              </span>
            )}
          </Link>
          <Link
            href="/matches"
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-white font-semibold text-xs hover:border-brand/40 flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Radio className="w-3.5 h-3.5 text-brand" />
            <span>Live Scoreboards</span>
          </Link>
          <Link
            href="/leagues"
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-white font-semibold text-xs hover:border-brand/40 flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 text-gold" />
            <span>Mpheni League</span>
          </Link>
        </div>
      </div>

      {/* Notice Banner: Result Confirmation Awaiting */}
      {awaitingConfirmationMatch && (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-300">
                Match Result Awaiting Your Confirmation!
              </p>
              <p className="text-xs text-amber-200/70">
                {awaitingConfirmationMatch.player1.profile?.displayName} ({awaitingConfirmationMatch.scorePlayer1}) vs{" "}
                {awaitingConfirmationMatch.player2.profile?.displayName} ({awaitingConfirmationMatch.scorePlayer2})
              </p>
            </div>
          </div>
          <Link
            href={`/matches/${awaitingConfirmationMatch.id}`}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs whitespace-nowrap transition-colors"
          >
            Review &amp; Confirm Result
          </Link>
        </div>
      )}

      {/* Grid: Live Competitions & Local Available Players */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column (2 Cols): Live Match Scoreboards */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold font-display text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />
              <span>Live Competition Feed</span>
            </h2>
            <Link
              href="/matches"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {liveMatches.map((m) => (
              <div
                key={m.id}
                className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-slate-muted gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand px-2 py-0.5 rounded bg-brand/10 border border-brand/20 whitespace-nowrap">
                    Race to {m.raceTo} · Blackball SA
                  </span>
                  <span className="truncate">{m.venue || "Table 1 Arena"}</span>
                </div>

                {/* Scoreboard using flex to guarantee score numbers never wrap vertically */}
                <div className="flex items-center justify-between gap-2 py-1">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white text-xs sm:text-sm truncate">
                      {m.player1.profile?.displayName}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-muted whitespace-nowrap">
                      {Math.round(m.player1.profile?.rating || 1200)} ELO
                    </p>
                  </div>

                  <div className="shrink-0 text-center px-1.5 sm:px-2">
                    <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-surface font-mono font-black text-brand text-xs sm:text-base border border-surface-border whitespace-nowrap inline-block">
                      {m.scorePlayer1} - {m.scorePlayer2}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 text-right">
                    <p className="font-bold text-white text-xs sm:text-sm truncate">
                      {m.player2.profile?.displayName}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-muted whitespace-nowrap">
                      {Math.round(m.player2.profile?.rating || 1200)} ELO
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-muted truncate">
                    {m.tournamentId ? "Mpheni Tournament" : "Direct Challenge"}
                  </span>
                  <Link
                    href={`/matches/${m.id}`}
                    className="text-xs font-bold text-brand hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap"
                  >
                    <span>View Scoreboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Local Available Players & Badges */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-white">
              Available in Your Area
            </h2>
            <Link
              href="/players"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Filter
            </Link>
          </div>

          <div className="space-y-3">
            {availableOpponents.map((opp) => (
              <div
                key={opp.id}
                className="p-3.5 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center font-bold text-sm text-white shrink-0">
                    {opp.profile?.displayName[0]}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">
                      {opp.profile?.displayName}
                    </p>
                    <p className="text-[11px] text-slate-muted">
                      {Math.round(opp.profile?.rating || 1200)} ELO · {opp.profile?.town}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/players?challenge=${opp.id}`}
                  className="px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/30 hover:bg-brand hover:text-black text-brand text-xs font-bold whitespace-nowrap transition-all"
                >
                  Challenge
                </Link>
              </div>
            ))}
          </div>

          {/* Trophy Cabinet Teaser */}
          <div className="p-5 rounded-2xl bg-surface-card border border-surface-border space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-muted flex items-center justify-between">
              <span>My Trophy Cabinet</span>
              <span className="text-gold font-mono">
                {user?.achievements.length || 0} Badges
              </span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {user?.achievements.slice(0, 3).map((ua) => (
                <div
                  key={ua.id}
                  className="p-2.5 rounded-xl bg-surface border border-surface-border text-center space-y-1 hover:border-gold/40 transition-colors"
                >
                  <Award className="w-5 h-5 mx-auto text-gold" />
                  <p className="text-[10px] font-bold text-white truncate">
                    {ua.achievement.title}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href={`/players/${profile?.username}`}
              className="text-xs font-semibold text-brand hover:underline block text-center pt-1"
            >
              View Full Profile &amp; History →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
