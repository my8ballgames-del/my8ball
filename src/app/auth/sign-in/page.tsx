"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Swords, Lock, Mail, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center space-y-3 mb-8">
        <div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden border border-brand/40 shadow-glow">
          <Image
            src="/assets/my8ball_logo.jpg"
            alt="My8ball Logo"
            fill
            className="object-cover"
          />
        </div>
        <h1 className="text-2xl font-extrabold font-display text-white">
          Sign In to My8ball
        </h1>
        <p className="text-xs text-slate-muted">
          Access your competitive matches, challenges, rankings, and team fixtures.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-2xl space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-muted absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@my8ball.co.za"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-sm text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-muted">Password</label>
              <span className="text-[11px] text-brand hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-muted absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-sm text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand text-black font-bold text-sm hover:bg-brand-hover shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Swords className="w-4 h-4" />
                <span>Enter Match Hub</span>
              </>
            )}
          </button>
        </form>

        <div className="border-t border-surface-border pt-4">
          <p className="text-[11px] font-bold text-slate-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Quick Demo Accounts (Click to Fill)</span>
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin("talifhani@my8ball.co.za")}
              className="px-3 py-2 rounded-lg bg-surface text-left text-xs hover:border-brand/40 border border-surface-border flex items-center justify-between text-slate-muted hover:text-white"
            >
              <span>Talifhani (Boyka · Diamond Tier)</span>
              <span className="font-mono text-[10px] text-brand">Auto-Fill</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("lucky@my8ball.co.za")}
              className="px-3 py-2 rounded-lg bg-surface text-left text-xs hover:border-brand/40 border border-surface-border flex items-center justify-between text-slate-muted hover:text-white"
            >
              <span>Lucky Khosa (Sniper · Diamond Tier)</span>
              <span className="font-mono text-[10px] text-gold">Auto-Fill</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@my8ball.co.za")}
              className="px-3 py-2 rounded-lg bg-surface text-left text-xs hover:border-brand/40 border border-surface-border flex items-center justify-between text-slate-muted hover:text-white"
            >
              <span>Chief Administrator (Admin Portal)</span>
              <span className="font-mono text-[10px] text-brand">Auto-Fill</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-muted">
          New to My8ball?{" "}
          <Link href="/auth/sign-up" className="text-brand font-semibold hover:underline">
            Register your profile
          </Link>
        </p>
      </div>
    </div>
  );
}
