"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Plus, AlertCircle, ArrowLeft } from "lucide-react";

export default function CreateTournamentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    location: "Mpheni Community Hall",
    venue: "Mpheni Legends Club Arena",
    ruleset: "BLACKBALL_SA",
    format: "GROUP_KNOCKOUT",
    type: "TEAM",
    raceTo: 5,
    numTables: 3,
    maxParticipants: 8,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create tournament");
      }

      router.push(`/tournaments/${data.tournament.slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <Link
        href="/tournaments"
        className="inline-flex items-center gap-1.5 text-xs text-slate-muted hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tournaments</span>
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-display text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-brand" />
          <span>Host a Tournament</span>
        </h1>
        <p className="text-xs text-slate-muted">
          Configure a one-day or weekend tournament with multi-table allocation and automatic bracket advancement.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-2xl space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-muted mb-1">
              Tournament Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Mpheni Monthly 8-Ball Invitational"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Location
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Mpheni Community Hall"
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Venue / Arena
              </label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Mpheni Legends Club Arena"
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="GROUP_KNOCKOUT">Group + Knockout</option>
                <option value="SINGLE_ELIMINATION">Single Elimination</option>
                <option value="ROUND_ROBIN">Round Robin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Competition Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="TEAM">Team Squads</option>
                <option value="INDIVIDUAL">Individual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Available Tables
              </label>
              <select
                value={formData.numTables}
                onChange={(e) => setFormData({ ...formData, numTables: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value={1}>1 Table</option>
                <option value={2}>2 Tables</option>
                <option value={3}>3 Tables</option>
                <option value={4}>4 Tables</option>
                <option value={6}>6 Tables</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-muted mb-1">
              Race To (Frames per Match)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 7, 9].map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setFormData({ ...formData, raceTo: target })}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                    formData.raceTo === target
                      ? "bg-brand text-black border-brand shadow-glow"
                      : "bg-surface-elevated text-slate-muted border-surface-border hover:text-white"
                  }`}
                >
                  Race to {target}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Publishing Tournament...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Host Tournament &amp; Open Registration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
