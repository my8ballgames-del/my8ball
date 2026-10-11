"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Plus, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function CreateTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [town, setTown] = useState("Mpheni");
  const [homeVenue, setHomeVenue] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, town, homeVenue, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create team");
      }

      router.push(`/teams/${data.team.slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <Link
        href="/teams"
        className="inline-flex items-center gap-1.5 text-xs text-slate-muted hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Teams</span>
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-display text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand" />
          <span>Register New Pool Squad</span>
        </h1>
        <p className="text-xs text-slate-muted">
          Form a competitive team to participate in community leagues and multi-player team fixtures. You will become the founding Captain.
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
              Team / Squad Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mpheni Cue Masters, Elim Blackball Titans"
              className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Home Town / Village
              </label>
              <input
                type="text"
                required
                value={town}
                onChange={(e) => setTown(e.target.value)}
                placeholder="e.g. Mpheni, Soweto"
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Home Pool Club / Venue
              </label>
              <input
                type="text"
                required
                value={homeVenue}
                onChange={(e) => setHomeVenue(e.target.value)}
                placeholder="e.g. Mpheni Legends Pool Club"
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-muted mb-1">
              Team Bio / Motto
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your squad identity, competitive ambition, or club history."
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
                <span>Registering Squad...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Team &amp; Assume Captaincy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
