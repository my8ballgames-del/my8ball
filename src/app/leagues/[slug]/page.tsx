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
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <Link
        href="/leagues"
        className="inline-flex items-center gap-1.5 text-xs text-slate-muted hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Leagues</span>
      </Link>

      {/* League Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-surface-border bg-surface-card p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                {league.format.replace("_", " ")} · EDITION #{league.edition}
              </span>
              <span className="text-xs text-slate-muted flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {league.location}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              {league.name}
            </h1>

            <p className="text-xs text-slate-muted">
              Organized by: <strong className="text-white">{league.organizer.profile?.displayName}</strong> · Sanctioned under {league.ruleset.replace("_", " ")}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-surface-border">
            <div>
              <span className="text-[10px] text-slate-muted uppercase font-bold block">
                Teams
              </span>
              <span className="font-mono text-2xl font-black text-brand">
                {league.participants.length}
              </span>
            </div>
            <div className="border-l border-surface-border pl-4">
              <span className="text-[10px] text-slate-muted uppercase font-bold block">
                Points System
              </span>
              <span className="font-mono text-xs font-bold text-white block mt-1">
                3W · 1D · 0L
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 pt-4 border-t border-surface-border/60 text-xs text-slate-muted leading-relaxed">
          {league.description}
        </p>

        {league.tournaments.length > 0 && (
          <div className="mt-4 pt-3 flex items-center gap-3">
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
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            <span>Official League Standings Table</span>
          </h2>
          <span className="text-xs font-mono text-slate-muted">
            Round Robin Regular Season
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-slate-muted uppercase font-bold text-[10px] tracking-wider border-b border-surface-border">
              <tr>
                <th className="py-3 px-4 text-center">Pos</th>
                <th className="py-3 px-4">Squad / Team</th>
                <th className="py-3 px-4">Captain</th>
                <th className="py-3 px-4 text-center">Played</th>
                <th className="py-3 px-4 text-center">Won</th>
                <th className="py-3 px-4 text-center">Drawn</th>
                <th className="py-3 px-4 text-center">Lost</th>
                <th className="py-3 px-4 text-center">Frames (W-L)</th>
                <th className="py-3 px-4 text-center">Diff</th>
                <th className="py-3 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {league.participants.map((p, idx) => (
                <tr
                  key={p.id}
                  className="hover:bg-surface-elevated/40 transition-colors"
                >
                  <td className="py-3.5 px-4 text-center">
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
                  <td className="py-3.5 px-4 font-bold text-white">
                    <Link
                      href={`/teams/${p.team?.slug}`}
                      className="hover:text-brand transition-colors"
                    >
                      {p.team?.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-slate-muted">
                    {p.team?.captain?.profile?.displayName}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">{p.played}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                    {p.wins}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-muted">
                    {p.draws}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-muted">
                    {p.losses}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-muted">
                    {p.framesWon} - {p.framesLost}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold">
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
                  <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-brand">
                    {p.points} PTS
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixtures & Results List */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-base font-bold font-display text-white">
          League Fixtures &amp; Encounters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {league.fixtures.map((f) => (
            <div
              key={f.id}
              className="p-4 rounded-xl bg-surface border border-surface-border/70 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-muted">
                <span>{f.round} · Table #{f.tableNumber}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
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

              <div className="flex items-center justify-between font-bold text-white">
                <span className="truncate max-w-[130px]">{f.team1?.name || "TBD"}</span>
                <span className="px-2 py-0.5 rounded bg-surface-card border border-surface-border font-mono font-black text-brand text-sm">
                  {f.score1} - {f.score2}
                </span>
                <span className="truncate max-w-[130px] text-right">
                  {f.team2?.name || "TBD"}
                </span>
              </div>

              {f.matchId && (
                <div className="pt-2 border-t border-surface-border/40 text-right">
                  <Link
                    href={`/matches/${f.matchId}`}
                    className="text-[11px] font-bold text-brand hover:underline inline-flex items-center gap-1"
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
