"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Medal, Plus, AlertCircle, ArrowLeft } from "lucide-react";

export default function CreateLeaguePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "Mpheni Community",
    competitionType: "TEAM",
    ruleset: "BLACKBALL_SA",
    format: "ROUND_ROBIN",
    raceTo: 5,
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create league");
      }

      router.push(`/leagues/${data.league.slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <Link
        href="/leagues"
        className="inline-flex items-center gap-1.5 text-xs text-slate-muted hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Leagues</span>
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-display text-white flex items-center gap-2">
          <Medal className="w-6 h-6 text-brand" />
          <span>Create Community League</span>
        </h1>
        <p className="text-xs text-slate-muted">
          Launch an organized ongoing league for local teams or players in your town or club.
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
              League Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Mpheni Community Pool League, Soweto Premier Cue Circuit"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Location / Town
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Mpheni Community, Elim"
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Competition Type
              </label>
              <select
                value={formData.competitionType}
                onChange={(e) => setFormData({ ...formData, competitionType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="TEAM">Team Competition (Squads)</option>
                <option value="INDIVIDUAL">Individual Players</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Rule Set
              </label>
              <select
                value={formData.ruleset}
                onChange={(e) => setFormData({ ...formData, ruleset: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="BLACKBALL_SA">Blackball SA (Official)</option>
                <option value="BLACKBALL_INTL">International Blackball (IBF)</option>
                <option value="WPA_8BALL">WPA World Standard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Competition Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="ROUND_ROBIN">Single Round Robin</option>
                <option value="DOUBLE_ROUND_ROBIN">Double Round Robin (Home &amp; Away)</option>
                <option value="GROUP_KNOCKOUT">Group Stage + Knockout</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-muted mb-1">
              Race To (Frames per Encounter)
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

          <div>
            <label className="block text-xs font-semibold text-slate-muted mb-1">
              League Description &amp; Regulations
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline participation qualifications, tournament schedule, and host pool clubs."
              className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Publishing League...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create League &amp; Generate Fixtures</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
