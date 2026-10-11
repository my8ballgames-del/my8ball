import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Medal,
  Calendar,
  Users,
  Trophy,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Radio,
  ArrowRight,
  Shield,
  MapPin,
} from "lucide-react";

export const revalidate = 0;

export default async function LeagueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const league = await prisma.league.findUnique({
    where: { slug },
    include: {
      organizer: { include: { profile: true } },
      participants: {
        include: {
          team: {
            include: { captain: { include: { profile: true } } },
          },
        },
        orderBy: [{ points: "desc" }, { wins: "desc" }, { framesWon: "desc" }],
      },
      fixtures: {
        include: {
          team1: true,
          team2: true,
        },
        orderBy: [{ round: "asc" }, { tableNumber: "asc" }],
      },
      tournaments: true,
    },
  });

  if (!league) {
    notFound();
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 max-w-5xl mx-auto">
      <Link
        href="/leagues"
        className="inline-flex items-center gap-1.5 text-xs text-slate-muted hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Leagues</span>
      </Link>

      {/* League Header Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-surface-border bg-surface-card p-4 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20 whitespace-nowrap">
                {league.format.replace("_", " ")} · EDITION #{league.edition}
              </span>
              <span className="text-xs text-slate-muted flex items-center gap-1 whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5" />
                {league.location}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold font-display text-white">
              {league.name}
            </h1>

            <p className="text-xs text-slate-muted">
              Organized by: <strong className="text-white">{league.organizer.profile?.displayName}</strong> · Sanctioned under {league.ruleset.replace("_", " ")}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-surface-border w-full sm:w-auto justify-around sm:justify-start">
            <div>
              <span className="text-[10px] text-slate-muted uppercase font-bold block whitespace-nowrap">
                Teams
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-brand whitespace-nowrap">
                {league.participants.length}
              </span>
            </div>
            <div className="border-l border-surface-border pl-4">
              <span className="text-[10px] text-slate-muted uppercase font-bold block whitespace-nowrap">
                Points System
              </span>
              <span className="font-mono text-xs font-bold text-white block mt-1 whitespace-nowrap">
                3W · 1D · 0L
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-surface-border/60 text-xs text-slate-muted leading-relaxed">
          {league.description}
        </p>

        {league.tournaments.length > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-muted">Connected Invitational:</span>
            <Link
              href={`/tournaments/${league.tournaments[0].slug}`}
              className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1"
            >
              <span>{league.tournaments[0].name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Official Standings Table */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold font-display text-white flex items-center gap-2">
            <Trophy className="w-4 sm:w-5 h-4 sm:h-5 text-gold shrink-0" />
            <span>Official League Standings</span>
          </h2>
          <span className="text-[10px] sm:text-xs font-mono text-slate-muted whitespace-nowrap">
            Round Robin
          </span>
        </div>

        {/* Mobile View: Dedicated Horizontal Standings Cards */}
        <div className="block md:hidden space-y-2.5">
          {league.participants.map((p, idx) => (
            <div
              key={p.id}
              className="p-3 rounded-xl bg-surface border border-surface-border space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`font-mono font-black text-xs inline-flex items-center justify-center w-6 h-6 rounded shrink-0 ${
                      idx === 0
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                        : idx === 1
                        ? "bg-slate-300/20 text-slate-200 border border-slate-300/40"
                        : idx === 2
                        ? "bg-amber-700/20 text-amber-400 border border-amber-700/40"
                        : "bg-surface-elevated text-slate-muted"
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/teams/${p.team?.slug}`}
                      className="font-bold text-xs text-white hover:text-brand block truncate"
                    >
                      {p.team?.name}
                    </Link>
                    <span className="text-[10px] text-slate-muted truncate block">
                      Capt. {p.team?.captain?.profile?.displayName}
                    </span>
                  </div>
                </div>

                <span className="font-mono font-black text-xs text-brand px-2 py-0.5 rounded bg-brand/10 border border-brand/20 whitespace-nowrap shrink-0">
                  {p.points} PTS
                </span>
              </div>

              {/* Horizontal Stats Row */}
              <div className="pt-2 border-t border-surface-border/50 flex items-center justify-between text-[11px] font-mono text-slate-muted whitespace-nowrap">
                <span>P: <strong className="text-white">{p.played}</strong></span>
                <span>W: <strong className="text-white">{p.wins}</strong></span>
                <span>D: <strong className="text-white">{p.draws}</strong></span>
                <span>L: <strong className="text-white">{p.losses}</strong></span>
                <span>Frames: <strong className="text-white">{p.framesWon}-{p.framesLost}</strong></span>
                <span className={p.framesWon - p.framesLost >= 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                  {p.framesWon - p.framesLost >= 0 ? "+" : ""}{p.framesWon - p.framesLost}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Table with Guaranteed Horizontal Columns */}
        <div className="hidden md:block overflow-x-auto table-responsive-container">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-surface text-slate-muted uppercase font-bold text-[10px] tracking-wider border-b border-surface-border">
              <tr>
                <th className="py-3 px-4 text-center whitespace-nowrap">Pos</th>
                <th className="py-3 px-4 whitespace-nowrap">Squad / Team</th>
                <th className="py-3 px-4 whitespace-nowrap">Captain</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Played</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Won</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Drawn</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Lost</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Frames (W-L)</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Diff</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {league.participants.map((p, idx) => (
                <tr
                  key={p.id}
                  className="hover:bg-surface-elevated/40 transition-colors"
                >
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`font-mono font-black text-sm inline-flex items-center justify-center w-6 h-6 rounded-lg ${
                        idx === 0
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                        : idx === 1
                          ? "bg-slate-300/20 text-slate-200 border border-slate-300/40"
                        : idx === 2
                          ? "bg-amber-700/20 text-amber-400 border border-amber-700/40"
                        : "text-slate-muted"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                    <Link
                      href={`/teams/${p.team?.slug}`}
                      className="hover:text-brand transition-colors"
                    >
                      {p.team?.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-slate-muted whitespace-nowrap">
                    {p.team?.captain?.profile?.displayName}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono whitespace-nowrap">{p.played}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-white whitespace-nowrap">
                    {p.wins}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-muted whitespace-nowrap">
                    {p.draws}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-muted whitespace-nowrap">
                    {p.losses}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-muted whitespace-nowrap">
                    {p.framesWon} - {p.framesLost}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold whitespace-nowrap">
                    <span
                      className={
                        p.framesWon - p.framesLost >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {p.framesWon - p.framesLost >= 0 ? "+" : ""}
                      {p.framesWon - p.framesLost}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-brand whitespace-nowrap">
                    {p.points} PTS
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixtures & Results List */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-sm sm:text-base font-bold font-display text-white">
          League Fixtures &amp; Encounters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {league.fixtures.map((f) => (
            <div
              key={f.id}
              className="p-3.5 sm:p-4 rounded-xl bg-surface border border-surface-border/70 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-muted">
                <span className="whitespace-nowrap">{f.round} · Table #{f.tableNumber}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap ${
                    f.status === "LIVE"
                      ? "bg-brand/10 text-brand border border-brand/20 animate-pulse"
                      : f.status === "COMPLETED"
                      ? "bg-surface-elevated text-slate-muted"
                      : "bg-amber-950/40 text-amber-400"
                  }`}
                >
                  {f.status}
                </span>
              </div>

              <div className="flex items-center justify-between font-bold text-white gap-2">
                <span className="truncate flex-1 text-xs sm:text-sm">{f.team1?.name || "TBD"}</span>
                <span className="px-2.5 py-0.5 rounded bg-surface-card border border-surface-border font-mono font-black text-brand text-xs sm:text-sm shrink-0 whitespace-nowrap">
                  {f.score1} - {f.score2}
                </span>
                <span className="truncate flex-1 text-right text-xs sm:text-sm">
                  {f.team2?.name || "TBD"}
                </span>
              </div>

              {f.matchId && (
                <div className="pt-2 border-t border-surface-border/40 text-right">
                  <Link
                    href={`/matches/${f.matchId}`}
                    className="text-[11px] font-bold text-brand hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>Open Scoreboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
