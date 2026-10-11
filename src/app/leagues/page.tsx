"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Medal,
  Plus,
  Users,
  Calendar,
  Trophy,
  MapPin,
  ChevronRight,
  Shield,
  ArrowRight,
} from "lucide-react";

interface LeagueItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  competitionType: string;
  ruleset: string;
  format: string;
  raceTo: number;
  status: string;
  emblemUrl: string;
  organizer: {
    profile: {
      displayName: string;
    };
  };
  participants: {
    id: string;
    points: number;
    team?: { name: string } | null;
  }[];
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<LeagueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leagues");
      if (res.ok) {
        const data = await res.json();
        setLeagues(data.leagues || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, []);

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold font-display text-white">
            Community Leagues
          </h1>
          <p className="text-xs text-slate-muted">
            Ongoing seasonal and monthly pool leagues organized for townships, villages, and local clubs.
          </p>
        </div>

        <Link
          href="/leagues/create"
          className="px-4 py-2.5 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow flex items-center gap-2 self-start sm:self-auto transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Create New League</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-muted">
          Loading community leagues...
        </div>
      ) : leagues.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-surface-card border border-surface-border">
          <Medal className="w-10 h-10 text-slate-muted mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No active leagues found</h3>
          <p className="text-xs text-slate-muted mt-1">Start a league for your town or venue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {leagues.map((league) => (
            <div
              key={league.id}
              className="p-4 sm:p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-all space-y-3.5 sm:space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20 whitespace-nowrap">
                    {league.format.replace("_", " ")} · {league.competitionType}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-display text-white mt-1 truncate">
                    {league.name}
                  </h3>
                  <p className="text-xs text-slate-muted flex items-center gap-1 mt-0.5 whitespace-nowrap">
                    <MapPin className="w-3.5 h-3.5" />
                    {league.location}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-xs sm:text-sm text-gold block whitespace-nowrap">
                    {league.participants.length} Teams
                  </span>
                  <span className="text-[10px] text-slate-muted whitespace-nowrap">Race to {league.raceTo}</span>
                </div>
              </div>

              <p className="text-xs text-slate-muted line-clamp-2 leading-relaxed">
                {league.description}
              </p>

              <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs gap-2">
                <span className="text-slate-muted truncate">
                  Organizer: <strong className="text-white">{league.organizer?.profile?.displayName}</strong>
                </span>

                <Link
                  href={`/leagues/${league.slug}`}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap"
                >
                  <span>Open League</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
