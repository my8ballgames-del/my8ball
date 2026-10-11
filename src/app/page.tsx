import React from "react";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Swords,
  Trophy,
  Users,
  ShieldCheck,
  ChevronRight,
  Flame,
  Radio,
  BookOpen,
  MapPin,
  Sparkles,
  Award,
  ArrowRight,
} from "lucide-react";
import { getDivisionColor } from "@/lib/elo";

export const revalidate = 0;

export default async function LandingPage() {
  // Fetch real counts and live matches from database
  const [totalPlayers, liveMatches, topRanked, activeLeague] = await Promise.all([
    prisma.profile.count(),
    prisma.match.findMany({
      where: { status: "IN_PROGRESS" },
      include: {
        player1: { include: { profile: true } },
        player2: { include: { profile: true } },
      },
      take: 2,
    }),
    prisma.profile.findMany({
      orderBy: { rating: "desc" },
      take: 4,
    }),
    prisma.league.findFirst({
      where: { slug: "mpheni-community-pool-league" },
      include: {
        participants: {
          include: { team: true },
          take: 3,
          orderBy: { points: "desc" },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-surface-border bg-surface-card shadow-2xl">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/hero_pool_table.jpg"
            alt="Championship 8-Ball Table"
            fill
            priority
            className="object-cover opacity-35 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl px-4 py-12 sm:px-12 sm:py-24 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand text-[11px] sm:text-xs font-semibold backdrop-blur-md whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-brand animate-ping shrink-0" />
            <span>Blackball 8-Ball Pool · South African Circuit</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-extrabold font-display tracking-tight text-white leading-tight">
            Your Game. <br />
            <span className="text-brand">Your Rivals.</span> <br />
            Your Ranking.
          </h1>

          <p className="text-sm sm:text-lg text-slate-muted max-w-xl leading-relaxed">
            Challenge local players in your village or township, compete with your squad, join sanctioned community leagues, and build your verified reputation one frame at a time.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/players"
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-brand text-black font-bold text-xs sm:text-sm hover:bg-brand-hover shadow-glow flex items-center gap-2 transition-all hover:scale-[1.02] whitespace-nowrap"
            >
              <Swords className="w-4 h-4 shrink-0" />
              <span>Find Your Competition</span>
            </Link>
            <Link
              href="/rankings"
              className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-surface-elevated/90 border border-surface-border text-white font-semibold text-xs sm:text-sm hover:bg-surface-elevated hover:border-brand/40 flex items-center gap-2 transition-all whitespace-nowrap"
            >
              <Trophy className="w-4 h-4 text-gold shrink-0" />
              <span>Explore Rankings</span>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-6 pt-4 sm:pt-6 border-t border-surface-border/60 max-w-md">
            <div>
              <p className="text-xl sm:text-2xl font-bold font-display text-white whitespace-nowrap">{totalPlayers}+</p>
              <p className="text-[10px] sm:text-xs text-slate-muted font-medium whitespace-nowrap">Ranked Players</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold font-display text-brand whitespace-nowrap">5</p>
              <p className="text-[10px] sm:text-xs text-slate-muted font-medium whitespace-nowrap">Mpheni Teams</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold font-display text-gold whitespace-nowrap">BSA</p>
              <p className="text-[10px] sm:text-xs text-slate-muted font-medium whitespace-nowrap">Official Rules</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Match Action Panel */}
      {liveMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand"></span>
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
                Live Competitions In Progress
              </h2>
            </div>
            <Link
              href="/matches"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {liveMatches.map((m) => (
              <div
                key={m.id}
                className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-brand/30 shadow-glow relative overflow-hidden space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-slate-muted gap-2">
                  <span className="px-2 py-0.5 rounded bg-brand/10 text-brand font-bold uppercase tracking-wider text-[10px] border border-brand/20 whitespace-nowrap">
                    Live · Race to {m.raceTo}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-muted shrink-0" />
                    <span className="truncate">{m.venue || "Mpheni Legends Club"}</span>
                  </span>
                </div>

                {/* Scoreboard using Flexbox guaranteeing horizontal score pill */}
                <div className="flex items-center justify-between gap-2 py-1">
                  {/* Player 1 */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center font-bold text-white text-sm sm:text-base shrink-0">
                      {m.player1.profile?.displayName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {m.player1.profile?.displayName}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-muted whitespace-nowrap">
                        {Math.round(m.player1.profile?.rating || 1200)} ELO
                      </p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="shrink-0 text-center px-1.5 sm:px-2">
                    <div className="px-2.5 sm:px-3 py-1 rounded-lg bg-surface-elevated border border-surface-border font-mono text-sm sm:text-lg font-extrabold text-brand whitespace-nowrap inline-block">
                      {m.scorePlayer1} - {m.scorePlayer2}
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div className="flex items-center justify-end gap-2 sm:gap-3 text-right min-w-0 flex-1">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {m.player2.profile?.displayName}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-muted whitespace-nowrap">
                        {Math.round(m.player2.profile?.rating || 1200)} ELO
                      </p>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center font-bold text-white text-sm sm:text-base shrink-0">
                      {m.player2.profile?.displayName[0]}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs gap-2">
                  <span className="text-[10px] sm:text-[11px] text-slate-muted truncate">
                    Rules: Blackball SA
                  </span>
                  <Link
                    href={`/matches/${m.id}`}
                    className="text-xs font-bold text-brand hover:text-brand-hover flex items-center gap-1 shrink-0 whitespace-nowrap"
                  >
                    <span>Live Scoreboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Three Pillars: Challenge, Compete, Earn Recognition */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Built for Grassroots &amp; Serious Pool Players
          </h2>
          <p className="text-sm text-slate-muted">
            From casual games at the corner pub to organized township monthly tournaments, My8ball gives every frame meaning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/30 text-brand flex items-center justify-center">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Challenge</h3>
            <p className="text-xs text-slate-muted leading-relaxed">
              Find registered players in Mpheni, Elim, Soweto, or your hometown. Toggle your availability, agree on the race-to format, and lock in the match with instant confirmation.
            </p>
            <Link
              href="/players"
              className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
            >
              <span>Explore Player Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">2. Compete</h3>
            <p className="text-xs text-slate-muted leading-relaxed">
              Real frame-by-frame scorekeeping with break tracking, foul logging, and anti-tamper dual player confirmations. Live bracket advancement for single-day 5-team tournaments.
            </p>
            <Link
              href="/tournaments"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
            >
              <span>View Tournament Brackets</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 text-gold flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">3. Earn Recognition</h3>
            <p className="text-xs text-slate-muted leading-relaxed">
              Climb verified Elo ratings from Rookie to Diamond and Elite. Unlock genuine achievement badges like &apos;Clean Sweep&apos; and &apos;Community Champion&apos; in your profile trophy cabinet.
            </p>
            <Link
              href="/rankings"
              className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:underline"
            >
              <span>Check Current Leaderboards</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Community League: Mpheni Community Pool League */}
      {activeLeague && (
        <section className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface-card border border-surface-border relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated text-gold text-xs font-semibold border border-gold/30 whitespace-nowrap">
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span>Sanctioned Community League · Limpopo</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold font-display text-white">
                {activeLeague.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
                {activeLeague.description}
              </p>
              <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-muted pt-2 flex-wrap">
                <div>
                  <span className="block font-bold text-white text-sm sm:text-base whitespace-nowrap">5</span>
                  <span className="whitespace-nowrap">Registered Teams</span>
                </div>
                <div>
                  <span className="block font-bold text-brand text-sm sm:text-base whitespace-nowrap">Blackball SA</span>
                  <span className="whitespace-nowrap">Standard Rules</span>
                </div>
                <div>
                  <span className="block font-bold text-gold text-sm sm:text-base whitespace-nowrap">Round Robin</span>
                  <span className="whitespace-nowrap">Points Format</span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  href={`/leagues/${activeLeague.slug}`}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <span>View League Standings &amp; Fixtures</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Standings Table Preview */}
            <div className="bg-surface rounded-2xl border border-surface-border p-3.5 sm:p-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-muted mb-3 flex items-center justify-between">
                <span>Top Standings</span>
                <span className="text-[10px] text-brand whitespace-nowrap">Pts: 3W · 1D · 0L</span>
              </h3>
              <div className="space-y-2">
                {activeLeague.participants.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-surface-card border border-surface-border/50 text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="w-4 sm:w-5 text-center font-bold text-slate-muted shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white truncate">{p.team?.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5 sm:gap-4 text-slate-muted font-mono shrink-0 whitespace-nowrap">
                      <span>{p.played}P</span>
                      <span className="text-white font-bold">{p.wins}W</span>
                      <span className="text-brand font-bold">{p.points} Pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Top Ranked Players Spotlight */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold font-display text-white">
              Elite Competitor Rankings
            </h2>
            <p className="text-xs text-slate-muted">
              Live Elo ratings updated through confirmed competition results.
            </p>
          </div>
          <Link
            href="/rankings"
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <span>Complete Rankings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {topRanked.map((player, idx) => {
            const divColor = getDivisionColor(player.division);
            return (
              <div
                key={player.id}
                className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-all relative space-y-3.5 sm:space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center font-bold text-base sm:text-lg text-white shrink-0">
                    {player.displayName[0]}
                  </div>
                  <span
                    className={`text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${divColor.bg} ${divColor.text} ${divColor.border}`}
                  >
                    {player.division}
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-white text-xs sm:text-sm truncate">
                    {player.displayName}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-muted truncate">
                    @{player.username} · {player.town}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-surface-border/60 text-xs">
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-slate-muted block whitespace-nowrap">Elo Rating</span>
                    <span className="font-mono font-bold text-brand text-xs sm:text-sm whitespace-nowrap">
                      {Math.round(player.rating)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] sm:text-[10px] text-slate-muted block whitespace-nowrap">Win Rate</span>
                    <span className="font-mono font-bold text-white text-xs sm:text-sm whitespace-nowrap">
                      {player.matchesPlayed > 0
                        ? Math.round((player.matchesWon / player.matchesPlayed) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <Link
                  href={`/players/${player.username}`}
                  className="w-full py-2 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 text-xs font-semibold text-white text-center block transition-colors border border-surface-border whitespace-nowrap"
                >
                  View Profile
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rules Library Callout */}
      <section className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-surface-card to-surface border border-surface-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-brand text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Blackball South Africa Standards</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold font-display text-white">
            End the Arguments: Master Official Blackball Rules
          </h2>
          <p className="text-xs text-slate-muted leading-relaxed">
            Learn why potting the black on the break is NOT an instant win, how the Free Shot visit works, and why street myths like &apos;two shots carry&apos; are prohibited in competitive play.
          </p>
        </div>
        <Link
          href="/rules"
          className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow whitespace-nowrap transition-all shrink-0"
        >
          Explore Rules &amp; Quiz
        </Link>
      </section>

      {/* Call to Action */}
      <section className="text-center py-8 sm:py-12 px-4 sm:px-6 rounded-2xl sm:rounded-3xl bg-surface-card border border-brand/30 shadow-glow space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-3xl font-extrabold font-display text-white">
          Ready to Claim Your Rank in South African Pool?
        </h2>
        <p className="text-xs sm:text-sm text-slate-muted max-w-lg mx-auto">
          Create your player profile in 30 seconds. Put your name on the board, find available opponents in your community, and start your journey to Elite.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link
            href="/auth/sign-up"
            className="w-full sm:w-auto px-8 py-3 sm:py-3.5 rounded-xl bg-brand text-black font-extrabold text-xs sm:text-sm hover:bg-brand-hover shadow-glow transition-all hover:scale-105 whitespace-nowrap"
          >
            Register as a Player
          </Link>
          <Link
            href="/players"
            className="w-full sm:w-auto px-6 py-3 sm:py-3.5 rounded-xl bg-surface-elevated border border-surface-border text-white font-semibold text-xs sm:text-sm hover:bg-surface-elevated/80 transition-all whitespace-nowrap"
          >
            Find Players First
          </Link>
        </div>
      </section>
    </div>
  );
}
