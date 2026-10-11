"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Trophy,
  Filter,
} from "lucide-react";

interface MatchItem {
  id: string;
  type: string;
  ruleset: string;
  raceTo: number;
  status: string;
  venue: string;
  tableNumber: number;
  scorePlayer1: number;
  scorePlayer2: number;
  winnerId: string | null;
  startedAt: string;
  endedAt: string | null;
  player1: {
    id: string;
    profile: {
      displayName: string;
      username: string;
      rating: number;
      town: string;
    };
  };
  player2: {
    id: string;
    profile: {
      displayName: string;
      username: string;
      rating: number;
      town: string;
    };
  };
  team1?: { name: string } | null;
  team2?: { name: string } | null;
  confirmation?: {
    player1Confirmed: boolean;
    player2Confirmed: boolean;
    isConfirmed: boolean;
  } | null;
}

export default function MatchesPage() {
  const [filter, setFilter] = useState<string>("ALL");
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const url =
        filter === "ALL"
          ? "/api/matches"
          : `/api/matches?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold font-display text-white">
            Live Competitions &amp; Scoreboards
          </h1>
          <p className="text-xs text-slate-muted">
            Follow active matches in real-time, view verified results, or review matches awaiting confirmation.
          </p>
        </div>

        {/* Filter Pills with horizontal scroll on small mobile screens */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-card border border-surface-border overflow-x-auto no-scrollbar whitespace-nowrap">
          {[
            { id: "ALL", label: "All Matches" },
            { id: "LIVE", label: "Live Now" },
            { id: "AWAITING", label: "Awaiting Conf." },
            { id: "COMPLETED", label: "Completed" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === f.id
                  ? "bg-brand text-black shadow-glow font-bold"
                  : "text-slate-muted hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-muted">
          Loading match scoreboards...
        </div>
      ) : matches.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-surface-card border border-surface-border space-y-3">
          <Radio className="w-10 h-10 text-slate-muted mx-auto" />
          <h3 className="text-base font-bold text-white">No matches found</h3>
          <p className="text-xs text-slate-muted max-w-sm mx-auto">
            There are currently no matches in this status. Challenge a player to initiate a live contest!
          </p>
          <Link
            href="/players"
            className="inline-block px-5 py-2 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow"
          >
            Find an Opponent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {matches.map((m) => {
            const isLive = m.status === "IN_PROGRESS";
            const isAwaiting = m.status === "AWAITING_CONFIRMATION";
            const isCompleted = m.status === "COMPLETED";
            const isDisputed = m.status === "DISPUTED";

            return (
              <div
                key={m.id}
                className={`p-3.5 sm:p-5 rounded-2xl bg-surface-card border transition-all space-y-3 sm:space-y-4 relative ${
                  isLive
                    ? "border-brand/40 shadow-glow"
                    : isAwaiting
                    ? "border-amber-500/40"
                    : "border-surface-border hover:border-brand/30"
                }`}
              >
                {/* Header status */}
                <div className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isLive && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/30 font-bold text-[10px] whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
                        <span>LIVE IN PROGRESS</span>
                      </span>
                    )}
                    {isAwaiting && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-600/40 font-bold text-[10px] whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        <span>AWAITING CONFIRMATION</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-elevated text-slate-muted font-bold text-[10px] whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>OFFICIAL RESULT</span>
                      </span>
                    )}
                    {isDisputed && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-600/40 font-bold text-[10px] whitespace-nowrap">
                        <AlertTriangle className="w-3 h-3" />
                        <span>UNDER DISPUTE</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-muted whitespace-nowrap shrink-0">
                    Race to {m.raceTo}
                  </span>
                </div>

                {/* Scoreboard display with Flexbox ensuring scores never wrap vertically */}
                <div className="flex items-center justify-between gap-2 py-2 bg-surface rounded-xl p-3 border border-surface-border/50">
                  {/* Player 1 */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs sm:text-sm font-bold truncate ${
                        m.winnerId === m.player1.id ? "text-brand" : "text-white"
                      }`}
                    >
                      {m.player1.profile.displayName}
                    </p>
                    <p className="text-[10px] text-slate-muted font-mono truncate">
                      {m.player1.profile.rating} ELO · {m.player1.profile.town}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="shrink-0 text-center px-1.5 sm:px-2">
                    <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-surface-card border border-surface-border font-mono font-black text-sm sm:text-base text-white whitespace-nowrap inline-block">
                      {m.scorePlayer1} - {m.scorePlayer2}
                    </span>
                  </div>

                  {/* Player 2 */}
                  <div className="min-w-0 flex-1 text-right">
                    <p
                      className={`text-xs sm:text-sm font-bold truncate ${
                        m.winnerId === m.player2.id ? "text-brand" : "text-white"
                      }`}
                    >
                      {m.player2.profile.displayName}
                    </p>
                    <p className="text-[10px] text-slate-muted font-mono truncate">
                      {m.player2.profile.rating} ELO · {m.player2.profile.town}
                    </p>
                  </div>
                </div>

                {/* Footer meta */}
                <div className="flex items-center justify-between text-xs text-slate-muted pt-2 border-t border-surface-border/60 gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-muted shrink-0" />
                    <span className="truncate">{m.venue || "Table 1 Arena"}</span>
                  </div>

                  <Link
                    href={`/matches/${m.id}`}
                    className="text-xs font-bold text-brand hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap"
                  >
                    <span>{isLive ? "Open Live Scoreboard" : "Match Breakdown"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
