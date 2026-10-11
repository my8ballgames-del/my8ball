"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Search,
  MapPin,
  Flame,
  Swords,
  ChevronRight,
  Filter,
  Medal,
  Sparkles,
} from "lucide-react";
import { getDivisionColor } from "@/lib/elo";

interface RankedPlayer {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  town: string;
  province: string;
  club: string;
  rating: number;
  peakRating: number;
  division: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  winRate: number;
  framesWon: number;
  framesLost: number;
  frameDifferential: number;
  streak: number;
  bestStreak: number;
  isAvailable: boolean;
  status: string;
  teamName: string | null;
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [province, setProvince] = useState("all");
  const [town, setTown] = useState("all");
  const [division, setDivision] = useState("all");
  const [search, setSearch] = useState("");

  const fetchRankings = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (province !== "all") query.append("province", province);
      if (town !== "all") query.append("town", town);
      if (division !== "all") query.append("division", division);

      const res = await fetch(`/api/rankings?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRankings(data.rankings || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [province, town, division]);

  const filtered = rankings.filter((r) =>
    search
      ? r.displayName.toLowerCase().includes(search.toLowerCase()) ||
        r.username.toLowerCase().includes(search.toLowerCase()) ||
        r.town.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Official South African Elo Classification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Competitive Player Leaderboards
          </h1>
          <p className="text-xs text-slate-muted">
            Calibrated Elo ratings adjusted exclusively through confirmed Blackball competition frames.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-surface-card border border-surface-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-muted absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player or community..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
          />
        </div>

        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
        >
          <option value="all">All Provinces</option>
          <option value="Limpopo">Limpopo</option>
          <option value="Gauteng">Gauteng</option>
          <option value="Western Cape">Western Cape</option>
        </select>

        <select
          value={town}
          onChange={(e) => setTown(e.target.value)}
          className="px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
        >
          <option value="all">All Towns &amp; Villages</option>
          <option value="Mpheni">Mpheni</option>
          <option value="Elim">Elim</option>
          <option value="Thohoyandou">Thohoyandou</option>
          <option value="Soweto">Soweto</option>
          <option value="Polokwane">Polokwane</option>
        </select>

        <select
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          className="px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
        >
          <option value="all">All Divisions</option>
          <option value="ELITE">Elite (2,100+)</option>
          <option value="CHAMPION">Champion (1,950+)</option>
          <option value="DIAMOND">Diamond (1,800+)</option>
          <option value="PLATINUM">Platinum (1,650+)</option>
          <option value="GOLD">Gold (1,500+)</option>
          <option value="SILVER">Silver (1,350+)</option>
          <option value="BRONZE">Bronze (1,200+)</option>
          <option value="ROOKIE">Rookie (&lt;1,200)</option>
        </select>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-muted">
          Calculating latest Elo standings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-card border border-surface-border space-y-2">
          <Trophy className="w-10 h-10 text-slate-muted mx-auto" />
          <h3 className="text-base font-bold text-white">No players match this filter</h3>
          <p className="text-xs text-slate-muted">Try choosing another town or division.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobile Card View (Handheld screens) */}
          <div className="block md:hidden space-y-2.5">
            {filtered.map((player, idx) => {
              const divColor = getDivisionColor(player.division);
              return (
                <div
                  key={player.id}
                  className="p-3.5 rounded-2xl bg-surface-card border border-surface-border space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`font-mono font-black text-xs inline-flex items-center justify-center w-6 h-6 rounded-lg shrink-0 ${
                          idx === 0
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                            : idx === 1
                            ? "bg-slate-300/20 text-slate-200 border border-slate-300/40"
                            : idx === 2
                            ? "bg-amber-700/20 text-amber-400 border border-amber-700/40"
                            : "text-slate-muted bg-surface-elevated"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/players/${player.username}`}
                          className="font-bold text-white text-xs hover:text-brand transition-colors block truncate"
                        >
                          {player.displayName}
                        </Link>
                        <span className="text-[10px] text-slate-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{player.town}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-black text-sm text-brand block leading-tight">
                        {player.rating}
                      </span>
                      <span
                        className={`text-[8px] uppercase font-bold px-1.5 py-0.2 rounded-full border inline-block ${divColor.bg} ${divColor.text} ${divColor.border}`}
                      >
                        {player.division}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal stats strip */}
                  <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2.5 rounded-xl bg-surface border border-surface-border/50 text-center text-[10px]">
                    <div>
                      <span className="text-slate-muted text-[9px] block">Record</span>
                      <span className="font-mono font-bold text-white whitespace-nowrap">
                        {player.matchesWon}W - {player.matchesLost}L
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-muted text-[9px] block">Win Rate</span>
                      <span className="font-mono font-bold text-white whitespace-nowrap">
                        {player.winRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-muted text-[9px] block">Streak</span>
                      <span className="font-mono font-bold text-gold flex items-center justify-center gap-0.5 whitespace-nowrap">
                        <Flame className="w-3 h-3 fill-gold shrink-0" />
                        <span>{player.streak}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-muted truncate max-w-[170px]">
                      {player.club}
                    </span>
                    <Link
                      href={`/players?challenge=${player.id}`}
                      className="px-3 py-1 rounded-lg bg-brand text-black font-bold text-[11px] hover:bg-brand-hover transition-all whitespace-nowrap shrink-0 shadow-sm"
                    >
                      Challenge
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Table View */}
          <div className="hidden md:block rounded-2xl bg-surface-card border border-surface-border overflow-hidden shadow-2xl">
            <div className="table-responsive-container">
              <table className="min-w-[700px] w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-surface text-slate-muted uppercase font-bold text-[10px] tracking-wider border-b border-surface-border">
                  <tr>
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Community</th>
                    <th className="py-3 px-4 text-center">Division</th>
                    <th className="py-3 px-4 text-right">Official Elo</th>
                    <th className="py-3 px-4 text-center">W / L</th>
                    <th className="py-3 px-4 text-center">Win %</th>
                    <th className="py-3 px-4 text-center">Streak</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50">
                  {filtered.map((player, idx) => {
                    const divColor = getDivisionColor(player.division);
                    return (
                      <tr
                        key={player.id}
                        className="hover:bg-surface-elevated/40 transition-colors"
                      >
                        {/* Rank Number */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`font-mono font-black text-sm inline-flex items-center justify-center w-7 h-7 rounded-lg ${
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

                        {/* Player Info */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Link
                            href={`/players/${player.username}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center font-bold text-white text-xs group-hover:border-brand transition-colors shrink-0">
                              {player.displayName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-white group-hover:text-brand transition-colors">
                                {player.displayName}
                              </p>
                              <p className="text-[10px] text-slate-muted font-mono">
                                @{player.username}
                              </p>
                            </div>
                          </Link>
                        </td>

                        {/* Community */}
                        <td className="py-3.5 px-4 text-slate-muted whitespace-nowrap">
                          <span className="text-xs text-white block">{player.town}</span>
                          <span className="text-[10px] text-slate-muted block">
                            {player.club}
                          </span>
                        </td>

                        {/* Division Badge */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${divColor.bg} ${divColor.text} ${divColor.border}`}
                          >
                            {player.division}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono">
                          <span className="font-bold text-sm text-brand block">
                            {player.rating}
                          </span>
                          <span className="text-[9px] text-slate-muted block">
                            Peak: {player.peakRating}
                          </span>
                        </td>

                        {/* W / L */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-muted whitespace-nowrap">
                          <span className="text-white font-bold">{player.matchesWon}</span> -{" "}
                          <span>{player.matchesLost}</span>
                        </td>

                        {/* Win Rate */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-white whitespace-nowrap">
                          {player.winRate}%
                        </td>

                        {/* Streak */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold text-gold">
                            <Flame className="w-3.5 h-3.5 fill-gold text-gold" />
                            <span>{player.streak}</span>
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/players?challenge=${player.id}`}
                            className="px-2.5 py-1 rounded-lg bg-brand/10 border border-brand/30 hover:bg-brand hover:text-black text-brand text-[11px] font-bold transition-all inline-block"
                          >
                            Challenge
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
