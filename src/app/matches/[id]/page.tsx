"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Swords,
  Radio,
  Trophy,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Shield,
  Zap,
  ArrowLeft,
  Flame,
  Award,
  Sparkles,
} from "lucide-react";

interface MatchDetail {
  id: string;
  type: string;
  ruleset: string;
  rulesetVersion: string;
  raceTo: number;
  status: string;
  venue: string;
  tableNumber: number;
  scorePlayer1: number;
  scorePlayer2: number;
  winnerId: string | null;
  startedAt: string;
  endedAt: string | null;
  player1Id: string;
  player2Id: string;
  player1: {
    id: string;
    profile: {
      displayName: string;
      username: string;
      rating: number;
      division: string;
      town: string;
    };
  };
  player2: {
    id: string;
    profile: {
      displayName: string;
      username: string;
      rating: number;
      division: string;
      town: string;
    };
  };
  team1?: { name: string } | null;
  team2?: { name: string } | null;
  confirmation?: {
    player1Confirmed: boolean;
    player2Confirmed: boolean;
    isConfirmed: boolean;
    disputed: boolean;
  } | null;
  frames: {
    id: string;
    frameNumber: number;
    winnerId: string;
    breakPlayerId: string | null;
    foulEvent: string | null;
    durationSeconds: number;
    notes: string | null;
  }[];
}

export default function MatchScoreboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submittingFrame, setSubmittingFrame] = useState(false);
  const [submittingConfirm, setSubmittingConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Frame form inputs
  const [breakPlayerId, setBreakPlayerId] = useState<string>("");
  const [foulEvent, setFoulEvent] = useState<string>("");
  const [frameNotes, setFrameNotes] = useState<string>("");

  // Dispute form state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeEvidence, setDisputeEvidence] = useState("");
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const fetchMatch = async () => {
    try {
      const res = await fetch(`/api/matches/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setMatch(data.match);
        if (!breakPlayerId && data.match) {
          setBreakPlayerId(data.match.player1Id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch {}
    }
    loadSession();
    fetchMatch();

    // Auto-refresh match state every 4 seconds for live updates across browser sessions
    const interval = setInterval(fetchMatch, 4000);
    return () => clearInterval(interval);
  }, [resolvedParams.id]);

  const handleRecordFrame = async (winnerId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmittingFrame(true);

    try {
      const res = await fetch(`/api/matches/${resolvedParams.id}/frame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerId,
          breakPlayerId: breakPlayerId || null,
          foulEvent: foulEvent || null,
          notes: frameNotes || null,
          durationSeconds: 180,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record frame");
      }

      setFrameNotes("");
      setFoulEvent("");
      // Alternate break player automatically
      if (match) {
        setBreakPlayerId(
          breakPlayerId === match.player1Id ? match.player2Id : match.player1Id
        );
      }

      setSuccessMsg(`Frame ${data.frameNumber} recorded successfully!`);
      await fetchMatch();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmittingFrame(false);
    }
  };

  const handleConfirmResult = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmittingConfirm(true);

    try {
      const res = await fetch(`/api/matches/${resolvedParams.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm match result");
      }

      setSuccessMsg(data.message);
      await fetchMatch();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmittingConfirm(false);
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDispute(true);
    try {
      const res = await fetch(`/api/matches/${resolvedParams.id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: disputeReason,
          evidenceNotes: disputeEvidence,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit dispute");
      }

      setShowDisputeModal(false);
      setSuccessMsg(data.message);
      await fetchMatch();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmittingDispute(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-muted">
        Loading live match scoreboard...
      </div>
    );
  }

  if (!match) {
    return (
      <div className="p-12 text-center rounded-2xl bg-surface-card border border-surface-border">
        <h2 className="text-base font-bold text-white">Match not found</h2>
        <Link href="/matches" className="text-xs text-brand hover:underline mt-2 inline-block">
          Return to matches
        </Link>
      </div>
    );
  }

  const isLive = match.status === "IN_PROGRESS";
  const isAwaiting = match.status === "AWAITING_CONFIRMATION";
  const isCompleted = match.status === "COMPLETED";
  const isDisputed = match.status === "DISPUTED";

  const p1Progress = Math.min((match.scorePlayer1 / match.raceTo) * 100, 100);
  const p2Progress = Math.min((match.scorePlayer2 / match.raceTo) * 100, 100);

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Top back navigation and match meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/matches"
          className="inline-flex items-center gap-1.5 text-xs text-slate-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Matches</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-surface-elevated border border-surface-border text-[11px] font-mono text-slate-muted">
            {match.ruleset.replace("_", " ")} ({match.rulesetVersion})
          </span>
          <span className="px-2.5 py-1 rounded-full bg-surface-elevated border border-surface-border text-[11px] text-slate-muted flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{match.venue || "Table 1"}</span>
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-brand/10 border border-brand/40 text-brand text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Scoreboard Arena Display */}
      <div className="relative rounded-3xl overflow-hidden border border-brand/30 bg-surface-card p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        {/* Status header banner */}
        <div className="flex items-center justify-center">
          {isLive && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/40 text-brand text-xs font-bold tracking-wider shadow-glow">
              <span className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />
              <span>LIVE COMPETITION · RACE TO {match.raceTo}</span>
            </div>
          )}
          {isAwaiting && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/70 border border-amber-500/50 text-amber-400 text-xs font-bold">
              <Clock className="w-4 h-4" />
              <span>RACE TO {match.raceTo} REACHED · AWAITING RESULT CONFIRMATION</span>
            </div>
          )}
          {isCompleted && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>OFFICIAL CONFIRMED RESULT</span>
            </div>
          )}
          {isDisputed && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/70 border border-red-500/50 text-red-300 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>OFFICIAL DISPUTE LODGED · REFEREE REVIEW PENDING</span>
            </div>
          )}
        </div>

        {/* Players & Big Score */}
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-6">
          {/* Player 1 Card */}
          <div className="md:col-span-3 text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-elevated border-2 border-surface-border flex items-center justify-center font-black text-2xl text-white shadow-xl">
                {match.player1.profile.displayName[0]}
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold font-display text-white">
                  {match.player1.profile.displayName}
                </p>
                <p className="text-xs text-slate-muted font-mono">
                  {match.player1.profile.rating} ELO · {match.player1.profile.division}
                </p>
                <p className="text-[11px] text-slate-muted">
                  {match.player1.profile.town}
                </p>
              </div>
            </div>

            {/* Frame Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-muted font-mono">
                <span>{match.scorePlayer1} Frames Won</span>
                <span>Target: {match.raceTo}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-500"
                  style={{ width: `${p1Progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center Giant Scores */}
          <div className="md:col-span-1 text-center py-2">
            <div className="inline-flex items-center justify-center px-6 py-4 rounded-2xl bg-surface border-2 border-surface-border font-mono text-4xl sm:text-5xl font-black text-white shadow-2xl gap-3">
              <span className={match.scorePlayer1 >= match.raceTo ? "text-brand" : ""}>
                {match.scorePlayer1}
              </span>
              <span className="text-slate-muted text-2xl">:</span>
              <span className={match.scorePlayer2 >= match.raceTo ? "text-brand" : ""}>
                {match.scorePlayer2}
              </span>
            </div>
            <p className="text-[11px] text-slate-muted font-bold mt-2 uppercase tracking-widest">
              First to {match.raceTo}
            </p>
          </div>

          {/* Player 2 Card */}
          <div className="md:col-span-3 text-center md:text-right space-y-2">
            <div className="flex items-center justify-center md:justify-end gap-4 flex-row-reverse md:flex-row">
              <div className="text-center md:text-right">
                <p className="text-lg sm:text-xl font-bold font-display text-white">
                  {match.player2.profile.displayName}
                </p>
                <p className="text-xs text-slate-muted font-mono">
                  {match.player2.profile.rating} ELO · {match.player2.profile.division}
                </p>
                <p className="text-[11px] text-slate-muted">
                  {match.player2.profile.town}
                </p>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-elevated border-2 border-surface-border flex items-center justify-center font-black text-2xl text-white shadow-xl">
                {match.player2.profile.displayName[0]}
              </div>
            </div>

            {/* Frame Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-muted font-mono">
                <span>{match.scorePlayer2} Frames Won</span>
                <span>Target: {match.raceTo}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full bg-brand transition-all duration-500 ml-auto"
                  style={{ width: `${p2Progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame Scorekeeping Actions (Active during IN_PROGRESS) */}
      {isLive && (
        <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-5">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <h3 className="font-bold font-display text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand" />
              <span>Record Frame Winner (Frame #{match.frames.length + 1})</span>
            </h3>
            <span className="text-[11px] text-slate-muted">
              Rules: One Free Shot + Visit on Standard Fouls
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleRecordFrame(match.player1Id)}
              disabled={submittingFrame}
              className="py-4 px-6 rounded-2xl bg-surface-elevated border border-surface-border hover:border-brand hover:bg-brand/10 text-white font-bold text-sm transition-all flex items-center justify-between shadow-lg disabled:opacity-50 group"
            >
              <span>+1 Frame for {match.player1.profile.displayName}</span>
              <span className="w-8 h-8 rounded-xl bg-brand text-black font-extrabold flex items-center justify-center group-hover:scale-110 transition-transform">
                +1
              </span>
            </button>

            <button
              onClick={() => handleRecordFrame(match.player2Id)}
              disabled={submittingFrame}
              className="py-4 px-6 rounded-2xl bg-surface-elevated border border-surface-border hover:border-brand hover:bg-brand/10 text-white font-bold text-sm transition-all flex items-center justify-between shadow-lg disabled:opacity-50 group"
            >
              <span>+1 Frame for {match.player2.profile.displayName}</span>
              <span className="w-8 h-8 rounded-xl bg-brand text-black font-extrabold flex items-center justify-center group-hover:scale-110 transition-transform">
                +1
              </span>
            </button>
          </div>

          {/* Break and foul metadata inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-muted mb-1">
                Break Player
              </label>
              <select
                value={breakPlayerId}
                onChange={(e) => setBreakPlayerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value={match.player1Id}>{match.player1.profile.displayName}</option>
                <option value={match.player2Id}>{match.player2.profile.displayName}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-muted mb-1">
                Foul / Clearance Event (Optional)
              </label>
              <select
                value={foulEvent}
                onChange={(e) => setFoulEvent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="">Clean Clearance (No Foul)</option>
                <option value="FOUL_CUE_SCRATCH">White Scratch into Pocket</option>
                <option value="FOUL_OPPONENT_BALL">Opponent Ball Hit First</option>
                <option value="LOSS_OF_FRAME_BLACK">Loss of Frame Foul on 8-Ball</option>
                <option value="LEGAL_CLEARANCE">Break &amp; Runout Clearance</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-muted mb-1">
                Frame Notes
              </label>
              <input
                type="text"
                value={frameNotes}
                onChange={(e) => setFrameNotes(e.target.value)}
                placeholder="e.g. Tough corner cut on black"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Flow Card (when AWAITING_CONFIRMATION) */}
      {isAwaiting && (
        <div className="p-6 rounded-2xl bg-surface-card border-2 border-amber-500/60 shadow-2xl space-y-5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Clock className="w-5 h-5" />
            <span>Dual-Player Result Confirmation Required</span>
          </div>

          <p className="text-xs text-slate-muted leading-relaxed">
            The target score of {match.raceTo} frames has been reached. In accordance with My8ball Fair Play standards, both participants must confirm the final score before official Elo rating adjustments and tournament advancement are executed.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface p-4 rounded-xl border border-surface-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">
                  {match.player1.profile.displayName}
                </p>
                <p className="text-[10px] text-slate-muted font-mono">
                  {match.confirmation?.player1Confirmed ? "Confirmed" : "Awaiting response"}
                </p>
              </div>
              {match.confirmation?.player1Confirmed ? (
                <CheckCircle2 className="w-6 h-6 text-brand" />
              ) : (
                <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
              )}
            </div>

            <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-l border-surface-border pt-2 sm:pt-0 sm:pl-4">
              <div>
                <p className="text-xs font-bold text-white">
                  {match.player2.profile.displayName}
                </p>
                <p className="text-[10px] text-slate-muted font-mono">
                  {match.confirmation?.player2Confirmed ? "Confirmed" : "Awaiting response"}
                </p>
              </div>
              {match.confirmation?.player2Confirmed ? (
                <CheckCircle2 className="w-6 h-6 text-brand" />
              ) : (
                <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              onClick={() => setShowDisputeModal(true)}
              className="text-xs text-red-400 hover:text-red-300 underline font-semibold"
            >
              Dispute This Result
            </button>

            <button
              onClick={handleConfirmResult}
              disabled={submittingConfirm}
              className="px-6 py-3 rounded-xl bg-brand text-black font-extrabold text-xs hover:bg-brand-hover shadow-glow flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Publish Official Result</span>
            </button>
          </div>
        </div>
      )}

      {/* Frame by Frame Timeline History */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <h3 className="font-bold font-display text-white text-sm flex items-center justify-between">
          <span>Frame-by-Frame Event Log</span>
          <span className="text-xs font-mono text-slate-muted">
            {match.frames.length} Frames Recorded
          </span>
        </h3>

        {match.frames.length === 0 ? (
          <p className="text-xs text-slate-muted py-6 text-center">
            No frames have been recorded yet. The match is at 0 - 0.
          </p>
        ) : (
          <div className="space-y-2">
            {match.frames.map((f) => {
              const winnerName =
                f.winnerId === match.player1Id
                  ? match.player1.profile.displayName
                  : match.player2.profile.displayName;
              const breakerName =
                f.breakPlayerId === match.player1Id
                  ? match.player1.profile.displayName
                  : f.breakPlayerId === match.player2Id
                  ? match.player2.profile.displayName
                  : null;

              return (
                <div
                  key={f.id}
                  className="p-3 rounded-xl bg-surface border border-surface-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-surface-elevated font-mono font-bold text-brand flex items-center justify-center shrink-0">
                      #{f.frameNumber}
                    </span>
                    <div>
                      <p className="font-bold text-white">
                        Won by {winnerName}
                      </p>
                      <p className="text-[11px] text-slate-muted">
                        {breakerName ? `Broke: ${breakerName}` : "Break recorded"}
                        {f.foulEvent && ` · Event: ${f.foulEvent.replace(/_/g, " ")}`}
                      </p>
                    </div>
                  </div>

                  {f.notes && (
                    <span className="italic text-slate-muted bg-surface-card px-2.5 py-1 rounded text-[11px] border border-surface-border/30">
                      &quot;{f.notes}&quot;
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-surface-card border border-surface-border shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Lodge Match Dispute</span>
            </h3>
            <p className="text-xs text-slate-muted">
              Disputed matches are frozen and excluded from official Elo calculations until an accredited referee or platform administrator reviews the evidence.
            </p>

            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-muted mb-1">
                  Reason for Dispute
                </label>
                <input
                  type="text"
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="e.g. Incorrect frame score recorded or foul controversy"
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-muted mb-1">
                  Detailed Evidence / Witness Notes
                </label>
                <textarea
                  rows={3}
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                  placeholder="Explain what occurred on the table and name witnesses or the club manager present."
                  className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated text-slate-muted hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
                >
                  {submittingDispute ? "Submitting..." : "Submit Dispute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
