"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Plus,
  Users,
  Trophy,
  MapPin,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";

interface TournamentItem {
  id: string;
  name: string;
  slug: string;
  location: string;
  venue: string;
  ruleset: string;
  format: string;
  type: string;
  raceTo: number;
  numTables: number;
  status: string;
  posterUrl: string;
  organizer: {
    profile: {
      displayName: string;
    };
  };
  registrations: {
    id: string;
    seed: number;
    team?: { name: string } | null;
  }[];
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tournaments");
      if (res.ok) {
        const data = await res.json();
        setTournaments(data.tournaments || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Tournaments &amp; Brackets
          </h1>
          <p className="text-xs text-slate-muted">
            Sanctioned one-day and multi-day knockout pool events with table assignments across South Africa.
          </p>
        </div>

        <Link
          href="/tournaments/create"
          className="px-4 py-2.5 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Host Tournament</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-muted">
          Loading tournaments...
        </div>
      ) : tournaments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-card border border-surface-border">
          <Calendar className="w-10 h-10 text-slate-muted mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No tournaments hosted yet</h3>
          <p className="text-xs text-slate-muted mt-1">Host an invitational or club championship.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-all space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                    {t.format.replace("_", " ")} · {t.numTables} TABLES
                  </span>
                  <h3 className="text-lg font-bold font-display text-white mt-1">
                    {t.name}
                  </h3>
                  <p className="text-xs text-slate-muted flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {t.location} · {t.venue}
                  </p>
                </div>

                <span className="font-mono font-bold text-sm text-brand px-2.5 py-1 rounded-lg bg-surface border border-surface-border">
                  {t.registrations.length} Seeds
                </span>
              </div>

              <div className="pt-2 flex items-center gap-4 text-xs text-slate-muted">
                <span>Rules: <strong>{t.ruleset.replace("_", " ")}</strong></span>
                <span>Race to: <strong>{t.raceTo}</strong></span>
                <span>Type: <strong>{t.type}</strong></span>
              </div>

              <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
                <span className="text-slate-muted">
                  Organizer: <strong className="text-white">{t.organizer.profile?.displayName}</strong>
                </span>

                <Link
                  href={`/tournaments/${t.slug}`}
                  className="px-4 py-2 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow flex items-center gap-1.5 transition-all"
                >
                  <span>Open Bracket &amp; Tables</span>
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
