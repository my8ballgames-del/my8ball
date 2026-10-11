"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Radio,
  AlertTriangle,
  Medal,
  Calendar,
  CheckCircle2,
  Lock,
  Sparkles,
  Ban,
  RotateCcw,
} from "lucide-react";

interface AdminData {
  metrics: {
    totalUsers: number;
    availablePlayers: number;
    liveMatches: number;
    completedMatches: number;
    openDisputes: number;
    totalTeams: number;
    activeLeagues: number;
    totalTournaments: number;
  };
  disputes: any[];
  users: any[];
  featureFlags: {
    WALLETS_AND_MONETARY_STAKES: boolean;
    BLACKBALL_RULES_STRICT_MODE: boolean;
    LIVE_SCOREBOARD_SSE: boolean;
    COMMUNITY_LEAGUES_ACTIVE: boolean;
  };
}

export default function AdminPortalPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin");
      if (res.status === 403 || res.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveDispute = async (disputeId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESOLVE_DISPUTE",
          disputeId,
          resolutionNotes: resolutionNote || "Resolved after referee review of table events.",
        }),
      });
      if (res.ok) {
        setResolutionNote("");
        fetchAdminData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSuspend = async (userId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_SUSPEND_USER",
          userId,
        }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-muted">Loading administrator portal...</div>;
  }

  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Lock className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-muted">
          Your current session does not have SUPER_ADMIN permissions. Please sign in as an accredited platform administrator.
        </p>
        <Link
          href="/auth/sign-in"
          className="inline-block px-5 py-2.5 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow"
        >
          Sign In with Admin Account
        </Link>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Super Administrator Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Platform Administration &amp; Disputes
          </h1>
          <p className="text-xs text-slate-muted">
            Platform health indicators, dispute arbitration, user suspension, and competition oversight.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-muted block">Registered Players</span>
          <span className="font-mono text-2xl font-black text-white">{data.metrics.totalUsers}</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-muted block">Available Now</span>
          <span className="font-mono text-2xl font-black text-brand">{data.metrics.availablePlayers}</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-muted block">Live Matches</span>
          <span className="font-mono text-2xl font-black text-amber-400">{data.metrics.liveMatches}</span>
        </div>
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border">
          <span className="text-[10px] uppercase font-bold text-slate-muted block">Completed Matches</span>
          <span className="font-mono text-2xl font-black text-emerald-400">{data.metrics.completedMatches}</span>
        </div>
      </div>

      {/* Feature Flags & Section 20 Compliance Notice */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-display text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Architectural Feature Boundaries (Section 20 Compliance)</span>
          </h2>
          <span className="text-[10px] uppercase font-bold text-slate-muted">v1.0 Release</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-surface-border/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Wallets &amp; Real-Money Stakes</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                DISABLED BY DESIGN
              </span>
            </div>
            <p className="text-[11px] text-slate-muted leading-relaxed">
              Monetary wagering, deposits, and cash stakes are strictly disabled. Architectural boundary preserved for future South African gambling and compliance review.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-surface-border/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">BSA Rules Strict Enforcement</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-muted leading-relaxed">
              Blackball South Africa official rules are strictly enforced across all competitive leagues and tournaments.
            </p>
          </div>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Match Disputes Queue ({data.disputes.length})</span>
          </h2>
          <span className="text-xs text-slate-muted">
            Freezes unconfirmed rating calculations until resolved
          </span>
        </div>

        {data.disputes.length === 0 ? (
          <p className="text-xs text-slate-muted py-6 text-center">
            No active disputes logged. All competitive matches are proceeding smoothly!
          </p>
        ) : (
          <div className="space-y-3">
            {data.disputes.map((d: any) => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-surface border border-surface-border space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">
                      Match: {d.match?.player1?.profile?.displayName} vs {d.match?.player2?.profile?.displayName}
                    </span>
                    <span className="text-slate-muted block text-[11px]">
                      Raised by: {d.raisedBy?.profile?.displayName} · Reason: &quot;{d.reason}&quot;
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      d.status === "OPEN"
                        ? "bg-red-950/60 text-red-300 border border-red-500/40"
                        : "bg-emerald-950/60 text-emerald-300"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                {d.status === "OPEN" && (
                  <div className="pt-2 border-t border-surface-border/50 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Resolution notes (e.g. Reviewed table event, score confirmed)"
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
                    />
                    <button
                      onClick={() => handleResolveDispute(d.id)}
                      disabled={actionLoading}
                      className="px-4 py-1.5 rounded-lg bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow whitespace-nowrap"
                    >
                      Resolve Dispute
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Moderation Table */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-brand" />
          <span>User Moderation &amp; Suspension</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-slate-muted uppercase font-bold text-[10px] tracking-wider border-b border-surface-border">
              <tr>
                <th className="py-2.5 px-3">Player</th>
                <th className="py-2.5 px-3">Community</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {data.users.map((u: any) => (
                <tr key={u.id} className="hover:bg-surface-elevated/40">
                  <td className="py-2.5 px-3 font-bold text-white">
                    {u.profile?.displayName} (@{u.profile?.username})
                  </td>
                  <td className="py-2.5 px-3 text-slate-muted">{u.profile?.town}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-brand">{u.role}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        u.isSuspended
                          ? "bg-red-950/60 text-red-300 border border-red-500/40"
                          : "bg-emerald-950/60 text-emerald-300"
                      }`}
                    >
                      {u.isSuspended ? "SUSPENDED" : "ACTIVE"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleToggleSuspend(u.id)}
                      disabled={actionLoading || u.role === "SUPER_ADMIN"}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        u.isSuspended
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                          : "bg-surface-elevated hover:bg-red-950 hover:text-red-300 text-slate-muted"
                      } disabled:opacity-30`}
                    >
                      {u.isSuspended ? "Reinstate" : "Suspend"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
