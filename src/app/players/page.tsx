"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  MapPin,
  Swords,
  Trophy,
  Filter,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  Flame,
  Shield,
} from "lucide-react";
import { getDivisionColor } from "@/lib/elo";

interface Player {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  town: string;
  province: string;
  club: string;
  skillLevel: string;
  rating: number;
  division: string;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  streak: number;
  status: string;
  isAvailable: boolean;
  preferredRuleSet: string;
  preferredVenue: string;
  primaryTeam: string | null;
}

function PlayersContent() {
  const searchParams = useSearchParams();
  const preSelectedId = searchParams.get("challenge");

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [town, setTown] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [ruleset, setRuleset] = useState("all");

  // Challenge modal state
  const [challengeTarget, setChallengeTarget] = useState<Player | null>(null);
  const [raceTo, setRaceTo] = useState(5);
  const [isPlayNow, setIsPlayNow] = useState(true);
  const [scheduledTime, setScheduledTime] = useState("");
  const [venue, setVenue] = useState("");
  const [message, setMessage] = useState("");
  const [challengeSubmitting, setChallengeSubmitting] = useState(false);
  const [challengeSuccess, setChallengeSuccess] = useState<string | null>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("q", search);
      if (town !== "all") query.append("town", town);
      if (ruleset !== "all") query.append("ruleset", ruleset);
      if (availableOnly) query.append("available", "true");

      const res = await fetch(`/api/players?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players);

        if (preSelectedId) {
          const matched = data.players.find((p: Player) => p.id === preSelectedId);
          if (matched) {
            setChallengeTarget(matched);
            setVenue(matched.preferredVenue || "Mpheni Legends Pool Club");
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [search, town, availableOnly, ruleset]);

  const handleSendChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeTarget) return;

    setChallengeSubmitting(true);
    setChallengeError(null);
    setChallengeSuccess(null);

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengedId: challengeTarget.id,
          type: "INDIVIDUAL",
          ruleset: challengeTarget.preferredRuleSet || "BLACKBALL_SA",
          raceTo,
          isPlayNow,
          scheduledTime: isPlayNow ? null : scheduledTime,
          venue: venue || challengeTarget.preferredVenue || "Community Club",
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to issue challenge");
      }

      setChallengeSuccess(
        `Challenge sent to ${challengeTarget.displayName}! They have been notified.`
      );
      setTimeout(() => {
        setChallengeTarget(null);
        setChallengeSuccess(null);
      }, 2500);
    } catch (err: any) {
      setChallengeError(err.message);
    } finally {
      setChallengeSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold font-display text-white">
            Find Players &amp; Opponents
          </h1>
          <p className="text-xs text-slate-muted">
            Discover registered competitors in your community, check availability, and issue instant challenges.
          </p>
        </div>

        <Link
          href="/challenges"
          className="px-4 py-2 rounded-xl bg-surface-card border border-surface-border text-slate-muted hover:text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto whitespace-nowrap"
        >
          <Swords className="w-4 h-4 text-brand" />
          <span>View My Challenges</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-surface-card border border-surface-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-muted absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, club..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
          />
        </div>

        {/* Town Filter */}
        <select
          value={town}
          onChange={(e) => setTown(e.target.value)}
          className="px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
        >
          <option value="all">All Towns &amp; Communities</option>
          <option value="Mpheni">Mpheni</option>
          <option value="Elim">Elim</option>
          <option value="Thohoyandou">Thohoyandou</option>
          <option value="Soweto">Soweto</option>
          <option value="Polokwane">Polokwane</option>
        </select>

        {/* Ruleset Filter */}
        <select
          value={ruleset}
          onChange={(e) => setRuleset(e.target.value)}
          className="px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
        >
          <option value="all">All Rule Sets</option>
          <option value="BLACKBALL_SA">Blackball SA (Official)</option>
          <option value="BLACKBALL_INTL">Blackball International</option>
          <option value="WPA_8BALL">WPA World Standard</option>
        </select>

        {/* Available Only Toggle */}
        <button
          type="button"
          onClick={() => setAvailableOnly(!availableOnly)}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
            availableOnly
              ? "bg-brand/10 border-brand text-brand shadow-glow"
              : "bg-surface-elevated border-surface-border text-slate-muted hover:text-white"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              availableOnly ? "bg-brand animate-ping" : "bg-slate-500"
            }`}
          />
          <span>Available to Play Now</span>
        </button>
      </div>

      {/* Players List */}
      {loading ? (
        <div className="py-20 text-center text-slate-muted text-xs">
          Loading community competitors...
        </div>
      ) : players.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-surface-card border border-surface-border space-y-3">
          <Users className="w-10 h-10 text-slate-muted mx-auto" />
          <h3 className="text-base font-bold text-white">No players found matching criteria</h3>
          <p className="text-xs text-slate-muted max-w-sm mx-auto">
            Try adjusting your location or filter settings, or turn on your availability so players can find you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {players.map((p) => {
            const divColor = getDivisionColor(p.division);
            const isPlaying = p.status === "IN_MATCH";
            const isAvail = p.isAvailable && !isPlaying;

            return (
              <div
                key={p.id}
                className="p-4 sm:p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-all space-y-3.5 sm:space-y-4 relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center font-extrabold text-base sm:text-lg text-white shrink-0">
                      {p.displayName[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[130px] sm:max-w-[160px]">
                        {p.displayName}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-muted font-mono truncate max-w-[130px] sm:max-w-[160px]">
                        @{p.username}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${divColor.bg} ${divColor.text} ${divColor.border}`}
                  >
                    {p.division}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-muted">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-muted shrink-0" />
                      <span className="truncate">{p.town}, {p.province}</span>
                    </span>
                    <span className="truncate font-medium text-slate-muted shrink-0">
                      {p.club}
                    </span>
                  </div>

                  {p.primaryTeam && (
                    <div className="flex items-center gap-1 text-gold text-[11px] font-semibold truncate">
                      <Shield className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{p.primaryTeam}</span>
                    </div>
                  )}
                </div>

                {/* Performance Metrics with guaranteed horizontal labels & numbers */}
                <div className="grid grid-cols-3 gap-1 sm:gap-2 py-2 px-2.5 sm:px-3 rounded-xl bg-surface border border-surface-border/50 text-center text-xs">
                  <div className="px-1">
                    <span className="text-[9px] sm:text-[10px] text-slate-muted block whitespace-nowrap">Elo</span>
                    <span className="font-mono font-bold text-brand whitespace-nowrap text-xs sm:text-sm">{p.rating}</span>
                  </div>
                  <div className="px-1">
                    <span className="text-[9px] sm:text-[10px] text-slate-muted block whitespace-nowrap">Win Rate</span>
                    <span className="font-mono font-bold text-white whitespace-nowrap text-xs sm:text-sm">{p.winRate}%</span>
                  </div>
                  <div className="px-1">
                    <span className="text-[9px] sm:text-[10px] text-slate-muted block whitespace-nowrap">Streak</span>
                    <span className="font-mono font-bold text-gold flex items-center justify-center gap-0.5 whitespace-nowrap text-xs sm:text-sm">
                      <Flame className="w-3 h-3 fill-gold shrink-0" />
                      {p.streak}
                    </span>
                  </div>
                </div>

                {/* Status indicator & Challenge button */}
                <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isAvail
                          ? "bg-brand animate-ping"
                          : isPlaying
                          ? "bg-amber-400"
                          : "bg-slate-500"
                      }`}
                    />
                    <span className="text-[10px] sm:text-[11px] text-slate-muted font-medium truncate whitespace-nowrap">
                      {isAvail ? "Available" : isPlaying ? "In Match" : "Unavailable"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={`/players/${p.username}`}
                      className="px-2.5 py-1.5 rounded-lg bg-surface-elevated text-slate-muted hover:text-white text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      disabled={isPlaying}
                      onClick={() => {
                        setChallengeTarget(p);
                        setVenue(p.preferredVenue || "Mpheni Legends Pool Club");
                        setChallengeError(null);
                        setChallengeSuccess(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        isPlaying
                          ? "bg-surface-elevated text-slate-500 cursor-not-allowed"
                          : "bg-brand text-black hover:bg-brand-hover shadow-glow"
                      }`}
                    >
                      Challenge
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Challenge Modal */}
      {challengeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-surface-card border border-surface-border shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-brand" />
                <h3 className="font-bold font-display text-white text-base">
                  Issue Challenge to {challengeTarget.displayName}
                </h3>
              </div>
              <button
                onClick={() => setChallengeTarget(null)}
                className="text-slate-muted hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {challengeError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                {challengeError}
              </div>
            )}

            {challengeSuccess ? (
              <div className="p-4 rounded-xl bg-brand/10 border border-brand/40 text-brand text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="text-xs font-bold">{challengeSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSendChallenge} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-muted mb-1.5">
                    Match Race-To Format
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 9].map((target) => (
                      <button
                        key={target}
                        type="button"
                        onClick={() => setRaceTo(target)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                          raceTo === target
                            ? "bg-brand text-black border-brand shadow-glow"
                            : "bg-surface-elevated text-slate-muted border-surface-border hover:text-white"
                        }`}
                      >
                        Race to {target}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-muted mb-1.5">
                    Match Timing
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPlayNow(true)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        isPlayNow
                          ? "bg-brand/10 border-brand text-brand"
                          : "bg-surface-elevated text-slate-muted border-surface-border"
                      }`}
                    >
                      Play Now (Immediate)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPlayNow(false)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        !isPlayNow
                          ? "bg-brand/10 border-brand text-brand"
                          : "bg-surface-elevated text-slate-muted border-surface-border"
                      }`}
                    >
                      Schedule Fixture
                    </button>
                  </div>
                </div>

                {!isPlayNow && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-muted mb-1">
                      Scheduled Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-muted mb-1">
                    Playing Venue / Pool Club
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Mpheni Legends Pool Club"
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-muted mb-1">
                    Optional Challenge Message
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. First to 5 under BSA rules!"
                    className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={challengeSubmitting}
                    className="w-full py-3 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {challengeSubmitting ? (
                      <span>Sending Official Challenge...</span>
                    ) : (
                      <>
                        <Swords className="w-4 h-4" />
                        <span>Confirm &amp; Send Challenge</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayersPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-muted text-xs">Loading player roster...</p>
        </div>
      }
    >
      <PlayersContent />
    </Suspense>
  );
}
