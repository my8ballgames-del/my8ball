"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Swords, User, Mail, Lock, MapPin, ShieldCheck, AlertCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    town: "Mpheni",
    province: "Limpopo",
    club: "Mpheni Legends Pool Club",
    skillLevel: "INTERMEDIATE",
    preferredRuleSet: "BLACKBALL_SA",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
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
          Join My8ball Community
        </h1>
        <p className="text-xs text-slate-muted">
          Register to challenge players, compete in leagues, and earn your verified Elo ranking.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1.5">
                Full Name / Display Name
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Talifhani Boyka"
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1.5">
                Unique Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="mpheni_ace"
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="player@gmail.com"
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1.5">
                Town / Township / Village
              </label>
              <input
                type="text"
                required
                value={formData.town}
                onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                placeholder="e.g. Mpheni, Elim, Soweto"
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white placeholder-slate-muted/50 focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1.5">
                Province
              </label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="Limpopo">Limpopo</option>
                <option value="Gauteng">Gauteng</option>
                <option value="Western Cape">Western Cape</option>
                <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                <option value="Mpumalanga">Mpumalanga</option>
                <option value="North West">North West</option>
                <option value="Eastern Cape">Eastern Cape</option>
                <option value="Free State">Free State</option>
                <option value="Northern Cape">Northern Cape</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1.5">
                Skill Level
              </label>
              <select
                value={formData.skillLevel}
                onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="BEGINNER">Beginner (Learning Rules)</option>
                <option value="INTERMEDIATE">Intermediate (Regular Player)</option>
                <option value="ADVANCED">Advanced (Club Competitor)</option>
                <option value="SEMI_PRO">Semi-Pro (Tournament Regular)</option>
                <option value="PRO">Pro (Provincial / National)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1.5">
                Preferred Rule Set
              </label>
              <select
                value={formData.preferredRuleSet}
                onChange={(e) => setFormData({ ...formData, preferredRuleSet: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="BLACKBALL_SA">Blackball SA (Official BSA)</option>
                <option value="BLACKBALL_INTL">International Blackball (IBF)</option>
                <option value="WPA_8BALL">WPA World Standardized</option>
                <option value="HOUSE_RULES">Local House Rules</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand text-black font-bold text-sm hover:bg-brand-hover shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Setting Up Player Profile...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-muted">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-brand font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
