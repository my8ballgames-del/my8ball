import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Calendar,
  Trophy,
  Users,
  MapPin,
  ArrowLeft,
  Radio,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";

export const revalidate = 0;

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      organizer: { include: { profile: true } },
      registrations: {
        include: {
          team: {
            include: { captain: { include: { profile: true } } },
          },
        },
        orderBy: { seed: "asc" },
      },
      fixtures: {
        include: {
          team1: true,
          team2: true,
        },
        orderBy: [{ round: "asc" }, { tableNumber: "asc" }],
      },
      league: true,
    },
  });

  if (!tournament) {
    notFound();
  }

  // Group fixtures by table
  const tableFixtures = [1, 2, 3].map((tableNum) => ({
    tableNumber: tableNum,
    fixtures: tournament.fixtures.filter((f) => f.tableNumber === tableNum),
  }));

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-5xl mx-auto">
      <Link
        href="/tournaments"
        className="inline-flex items-center gap-1.5 text-xs text-slate-muted hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tournaments</span>
      </Link>

      {/* Header Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-surface-border bg-surface-card p-4 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/30 whitespace-nowrap">
                {tournament.status.replace("_", " ")} · {tournament.format.replace("_", " ")}
              </span>
              <span className="text-xs text-slate-muted flex items-center gap-1 whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5" />
                {tournament.venue}, {tournament.location}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold font-display text-white">
              {tournament.name}
            </h1>

            <p className="text-xs text-slate-muted">
              Host: <strong className="text-white">{tournament.organizer.profile?.displayName}</strong> · Race to {tournament.raceTo} Frames · Rules: {tournament.ruleset.replace("_", " ")}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-surface-border w-full sm:w-auto justify-around sm:justify-start">
            <div>
              <span className="text-[10px] text-slate-muted uppercase font-bold block whitespace-nowrap">
                Arena Tables
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-brand whitespace-nowrap">
                {tournament.numTables} Tables
              </span>
            </div>
            <div className="border-l border-surface-border pl-4">
              <span className="text-[10px] text-slate-muted uppercase font-bold block whitespace-nowrap">
                Registered Seeds
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-gold whitespace-nowrap">
                {tournament.registrations.length} Teams
              </span>
            </div>
          </div>
        </div>

        {tournament.league && (
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-surface-border/60 flex items-center gap-2 text-xs text-slate-muted flex-wrap">
            <span className="whitespace-nowrap">Affiliated with Official League:</span>
            <Link
              href={`/leagues/${tournament.league.slug}`}
              className="text-brand font-bold hover:underline"
            >
              {tournament.league.name}
            </Link>
          </div>
        )}
      </div>

      {/* Multi-Table Venue Allocation Schedule */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
          <h2 className="text-sm sm:text-base font-bold font-display text-white flex items-center gap-2">
            <Layers className="w-4 sm:w-5 h-4 sm:h-5 text-brand shrink-0" />
            <span>Arena Table Allocation (Tables 1 - {tournament.numTables})</span>
          </h2>
          <span className="text-[11px] sm:text-xs text-slate-muted">
            Prevents table conflicts throughout competition day
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {tableFixtures.map(({ tableNumber, fixtures }) => (
            <div
              key={tableNumber}
              className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-surface border border-surface-border space-y-3"
            >
              <div className="flex items-center justify-between border-b border-surface-border pb-2">
                <span className="font-display font-bold text-white text-xs sm:text-sm">
                  Table #{tableNumber}
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand/10 text-brand whitespace-nowrap">
                  Active
                </span>
              </div>

              {fixtures.length === 0 ? (
                <p className="text-xs text-slate-muted py-4 text-center">
                  No fixtures currently assigned.
                </p>
              ) : (
                <div className="space-y-2">
                  {fixtures.map((f) => {
                    const isLive = f.status === "LIVE";
                    return (
                      <div
                        key={f.id}
                        className={`p-3 rounded-xl border transition-all text-xs space-y-2 ${
                          isLive
                            ? "bg-brand/5 border-brand/40 shadow-glow"
                            : "bg-surface-card border-surface-border/60"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-muted">
                          <span className="whitespace-nowrap">{f.round}</span>
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                              isLive
                                ? "bg-brand text-black animate-pulse"
                                : "bg-surface-elevated text-slate-muted"
                            }`}
                          >
                            {f.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between font-bold text-white gap-2">
                          <span className="truncate flex-1 text-xs">{f.team1?.name}</span>
                          <span className="px-2 py-0.5 rounded bg-surface font-mono text-brand text-xs shrink-0 whitespace-nowrap">
                            {f.score1} - {f.score2}
                          </span>
                          <span className="truncate flex-1 text-right text-xs">{f.team2?.name}</span>
                        </div>

                        {f.matchId && (
                          <div className="pt-1 text-right">
                            <Link
                              href={`/matches/${f.matchId}`}
                              className="text-[10px] font-bold text-brand hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                            >
                              <span>{isLive ? "Live Scoreboard" : "View Result"}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Knockout Bracket Visualizer */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4 sm:space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
          <h2 className="text-sm sm:text-base font-bold font-display text-white flex items-center gap-2">
            <Trophy className="w-4 sm:w-5 h-4 sm:h-5 text-gold shrink-0" />
            <span>Knockout Tournament Bracket</span>
          </h2>
          <span className="text-[11px] sm:text-xs font-mono text-gold whitespace-nowrap">
            Race to {tournament.raceTo} Frames
          </span>
        </div>

        <p className="text-[10px] text-slate-muted md:hidden block">
          👉 Swipe horizontally to follow tournament progression
        </p>

        <div className="overflow-x-auto table-responsive-container pb-2">
          <div className="min-w-[650px] grid grid-cols-3 gap-4 sm:gap-6 items-center">
            {/* Round 1 (Morning Matches) */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-muted text-center pb-2 border-b border-surface-border whitespace-nowrap">
                Round 1 · Prelims
              </h3>

              <div className="p-3 rounded-xl bg-surface border border-surface-border space-y-2 text-xs">
                <span className="text-[10px] text-slate-muted block font-mono whitespace-nowrap">Fixture A · Table 1</span>
                <div className="flex justify-between items-center font-bold text-white gap-2">
                  <span className="text-brand truncate">Mpheni Cue Masters</span>
                  <span className="font-mono text-brand shrink-0">5</span>
                </div>
                <div className="flex justify-between items-center text-slate-muted gap-2">
                  <span className="truncate">Elim Blackball Titans</span>
                  <span className="font-mono shrink-0">2</span>
                </div>
                <span className="text-[10px] text-emerald-400 block pt-1 border-t border-surface-border/40 whitespace-nowrap">
                  ✔ Advanced to Semi-Final
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-surface-border space-y-2 text-xs">
                <span className="text-[10px] text-slate-muted block font-mono whitespace-nowrap">Fixture B · Table 2</span>
                <div className="flex justify-between items-center font-bold text-white gap-2">
                  <span className="text-brand truncate">Soweto 8-Ball Legends</span>
                  <span className="font-mono text-brand shrink-0">5</span>
                </div>
                <div className="flex justify-between items-center text-slate-muted gap-2">
                  <span className="truncate">Venda Royal Shooters</span>
                  <span className="font-mono shrink-0">1</span>
                </div>
                <span className="text-[10px] text-emerald-400 block pt-1 border-t border-surface-border/40 whitespace-nowrap">
                  ✔ Advanced to Semi-Final
                </span>
              </div>
            </div>

            {/* Round 2 (Semi-Final) */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand text-center pb-2 border-b border-surface-border whitespace-nowrap">
                Semi-Final · LIVE NOW
              </h3>

              <div className="p-3.5 sm:p-4 rounded-xl bg-surface-elevated border-2 border-brand/50 shadow-glow space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-brand">
                  <span className="whitespace-nowrap">Table #1 Arena</span>
                  <span className="animate-ping w-2 h-2 rounded-full bg-brand" />
                </div>
                <div className="flex justify-between items-center font-bold text-white gap-2">
                  <span className="truncate">Mpheni Cue Masters</span>
                  <span className="font-mono text-base sm:text-lg font-black text-brand shrink-0">3</span>
                </div>
                <div className="flex justify-between items-center font-bold text-white gap-2">
                  <span className="truncate">Soweto 8-Ball Legends</span>
                  <span className="font-mono text-base sm:text-lg font-black text-white shrink-0">2</span>
                </div>
                <Link
                  href="/matches"
                  className="w-full py-1.5 mt-2 rounded bg-brand text-black font-extrabold text-[11px] block text-center whitespace-nowrap"
                >
                  Watch Frame 6 Live
                </Link>
              </div>
            </div>

            {/* Grand Final */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold text-center pb-2 border-b border-surface-border whitespace-nowrap">
                Championship Grand Final
              </h3>

              <div className="p-3.5 sm:p-4 rounded-xl bg-surface border border-gold/40 space-y-2.5 text-xs text-center">
                <Trophy className="w-7 sm:w-8 h-7 sm:h-8 text-gold mx-auto" />
                <div>
                  <p className="font-bold text-white">Winner of Semi-Final</p>
                  <p className="text-[10px] text-slate-muted">vs Bye Seed (Limpopo Spin Hawks)</p>
                </div>
                <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20 block whitespace-nowrap">
                  Scheduled 17:00 · Table 1
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Teams Seeds List */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-sm sm:text-base font-bold font-display text-white flex items-center gap-2">
          <Users className="w-4 sm:w-5 h-4 sm:h-5 text-brand shrink-0" />
          <span>Registered Seeds &amp; Squads ({tournament.registrations.length})</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
          {tournament.registrations.map((reg) => (
            <div
              key={reg.id}
              className="p-3 sm:p-3.5 rounded-xl bg-surface border border-surface-border flex items-center justify-between text-xs gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded bg-surface-elevated font-mono font-bold text-gold flex items-center justify-center text-xs shrink-0">
                  #{reg.seed}
                </span>
                <span className="font-bold text-white truncate">{reg.team?.name}</span>
              </div>
              <span className="text-[10px] text-slate-muted font-mono font-semibold truncate shrink-0">
                {reg.team?.captain?.profile?.displayName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
