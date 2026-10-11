"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Swords,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  AlertCircle,
  Radio,
  ArrowRight,
  Flame,
} from "lucide-react";

interface ChallengeItem {
  id: string;
  type: string;
  ruleset: string;
  raceTo: number;
  isPlayNow: boolean;
  scheduledTime: string | null;
  venue: string;
  message: string;
  status: string;
  matchId: string | null;
  createdAt: string;
  challenger: {
    id: string;
    profile: {
      username: string;
      displayName: string;
      rating: number;
      town: string;
    };
  };
  challenged: {
    id: string;
    profile: {
      username: string;
      displayName: string;
      rating: number;
      town: string;
    };
  };
}

export default function ChallengesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [received, setReceived] = useState<ChallengeItem[]>([]);
  const [sent, setSent] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/challenges");
      if (res.ok) {
        const data = await res.json();
        setReceived(data.received || []);
        setSent(data.sent || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleRespond = async (id: string, action: "ACCEPT" | "DECLINE" | "CANCEL") => {
    setActionError(null);
    try {
      const res = await fetch(`/api/challenges/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process challenge response");
      }

      if (action === "ACCEPT" && data.matchId) {
        router.push(`/matches/${data.matchId}`);
        return;
      }

      fetchChallenges();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const list = tab === "received" ? received : sent;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Challenge Match Hub
        </h1>
        <p className="text-xs text-slate-muted">
          Manage your incoming player challenges, track outgoing fixtures, and launch live matches.
        </p>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-surface-border gap-4">
        <button
          onClick={() => setTab("received")}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 ${
            tab === "received" ? "text-brand" : "text-slate-muted hover:text-white"
          }`}
        >
          <span>Incoming Challenges</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-elevated text-[10px] font-mono">
            {received.filter((c) => c.status === "PENDING").length}
          </span>
          {tab === "received" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
          )}
        </button>

        <button
          onClick={() => setTab("sent")}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 ${
            tab === "sent" ? "text-brand" : "text-slate-muted hover:text-white"
          }`}
        >
          <span>Outgoing Sent</span>
          <span className="px-2 py-0.5 rounded-full bg-surface-elevated text-[10px] font-mono">
            {sent.filter((c) => c.status === "PENDING").length}
          </span>
          {tab === "sent" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
          )}
        </button>
      </div>

      {/* Challenge Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-muted">
          Loading challenge inbox...
        </div>
      ) : list.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-card border border-surface-border space-y-3">
          <Swords className="w-10 h-10 text-slate-muted mx-auto" />
          <h3 className="text-base font-bold text-white">
            {tab === "received" ? "No incoming challenges" : "No outgoing challenges sent"}
          </h3>
          <p className="text-xs text-slate-muted max-w-sm mx-auto">
            Ready to compete? Head to the player directory and challenge someone available to play in your area.
          </p>
          <Link
            href="/players"
            className="inline-block px-5 py-2 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow"
          >
            Find Players Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((c) => {
            const isIncoming = tab === "received";
            const otherPlayer = isIncoming ? c.challenger : c.challenged;
            const isPending = c.status === "PENDING";
            const isInProgress = c.status === "IN_PROGRESS";

            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        isPending
                          ? "bg-amber-950/50 text-amber-400 border border-amber-600/40"
                          : isInProgress
                          ? "bg-brand/10 text-brand border border-brand/30 animate-pulse"
                          : c.status === "COMPLETED"
                          ? "bg-emerald-950/50 text-emerald-400 border border-emerald-600/40"
                          : "bg-surface-elevated text-slate-muted"
                      }`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      Race to {c.raceTo} · {c.ruleset.replace("_", " ")}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-muted">
                    {c.isPlayNow ? "Play Now (Immediate)" : "Scheduled Match"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center font-bold text-white text-base">
                      {otherPlayer.profile.displayName[0]}
                    </div>
                    <div>
                      <p className="text-xs text-slate-muted">
                        {isIncoming ? "Challenger:" : "Challenged:"}
                      </p>
                      <p className="text-sm font-bold text-white">
                        {otherPlayer.profile.displayName}
                      </p>
                      <p className="text-xs text-slate-muted font-mono">
                        {otherPlayer.profile.rating} ELO · {otherPlayer.profile.town}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-muted">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-muted shrink-0" />
                      <span className="truncate">{c.venue}</span>
                    </div>
                    {c.message && (
                      <p className="italic text-slate-muted/80 bg-surface px-2.5 py-1 rounded-lg border border-surface-border/40">
                        &quot;{c.message}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-surface-border/60 flex items-center justify-end gap-2">
                  {isIncoming && isPending && (
                    <>
                      <button
                        onClick={() => handleRespond(c.id, "DECLINE")}
                        className="px-4 py-2 rounded-xl bg-surface-elevated text-slate-muted hover:text-white text-xs font-semibold transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRespond(c.id, "ACCEPT")}
                        className="px-5 py-2 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept &amp; Launch Match</span>
                      </button>
                    </>
                  )}

                  {!isIncoming && isPending && (
                    <button
                      onClick={() => handleRespond(c.id, "CANCEL")}
                      className="px-4 py-2 rounded-xl bg-surface-elevated text-slate-muted hover:text-red-400 text-xs font-semibold transition-colors"
                    >
                      Cancel Challenge
                    </button>
                  )}

                  {isInProgress && c.matchId && (
                    <Link
                      href={`/matches/${c.matchId}`}
                      className="px-5 py-2 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow flex items-center gap-1.5 transition-all"
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span>Open Live Scoreboard</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
