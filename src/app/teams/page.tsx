"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Plus,
  Users,
  Trophy,
  MapPin,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface TeamItem {
  id: string;
  rank: number;
  name: string;
  slug: string;
  emblemUrl: string;
  town: string;
  homeVenue: string;
  rating: number;
  division: string;
  wins: number;
  losses: number;
  draws: number;
  description: string;
  captain: {
    id: string;
    username: string;
    displayName: string;
  };
  memberCount: number;
  members: {
    id: string;
    username: string;
    displayName: string;
    role: string;
    rating: number;
  }[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Registered Teams &amp; Squads
          </h1>
          <p className="text-xs text-slate-muted">
            Squad competition in South African community leagues. Form your squad or challenge rival teams.
          </p>
        </div>

        <Link
          href="/teams/create"
          className="px-4 py-2.5 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Team</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-muted">
          Loading competitive teams...
        </div>
      ) : teams.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-card border border-surface-border">
          <Shield className="w-10 h-10 text-slate-muted mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No teams registered yet</h3>
          <p className="text-xs text-slate-muted mt-1">Be the first to register a squad in your community!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className="p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-brand/30 shadow-glow">
                    <Image
                      src={team.emblemUrl || "/assets/my8ball_logo.jpg"}
                      alt={team.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{team.name}</h3>
                    <p className="text-xs text-slate-muted flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {team.town} · {team.homeVenue}
                    </p>
                  </div>
                </div>

                <span className="font-mono font-black text-sm text-gold px-2.5 py-1 rounded-lg bg-surface border border-surface-border">
                  #{idx + 1}
                </span>
              </div>

              <p className="text-xs text-slate-muted line-clamp-2 leading-relaxed">
                {team.description}
              </p>

              {/* Roster preview */}
              <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-muted">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    Captain: <strong className="text-white">{team.captain.displayName}</strong>
                  </span>
                </div>
                <span className="font-mono font-bold text-brand">
                  {team.rating} Team ELO
                </span>
              </div>

              <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-muted font-mono">
                  {team.memberCount} Squad Members
                </span>
                <Link
                  href={`/teams/${team.slug}`}
                  className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                >
                  <span>Team Profile &amp; Roster</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
