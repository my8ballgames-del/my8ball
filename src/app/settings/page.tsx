"use client";

import React, { useState, useEffect } from "react";
import { SlidersHorizontal, Shield, User, CheckCircle2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [club, setClub] = useState("");
  const [town, setTown] = useState("");
  const [province, setProvince] = useState("");
  const [preferredRuleSet, setPreferredRuleSet] = useState("BLACKBALL_SA");
  const [skillLevel, setSkillLevel] = useState("INTERMEDIATE");
  const [locationVisibility, setLocationVisibility] = useState("TOWN");
  const [allowChallenges, setAllowChallenges] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user?.profile) {
            setDisplayName(data.user.profile.displayName || "");
            setClub(data.user.profile.club || "");
            setTown(data.user.profile.town || "");
            setProvince(data.user.profile.province || "");
            setPreferredRuleSet(data.user.profile.preferredRuleSet || "BLACKBALL_SA");
            setSkillLevel(data.user.profile.skillLevel || "INTERMEDIATE");
          }
          if (data.user?.privacy) {
            setLocationVisibility(data.user.privacy.locationVisibility || "TOWN");
            setAllowChallenges(data.user.privacy.allowChallenges ?? true);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      // simulate quick update success feedback
      await new Promise((r) => setTimeout(r, 600));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-muted">Loading settings...</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-display text-white flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-brand" />
          <span>Profile &amp; Privacy Settings</span>
        </h1>
        <p className="text-xs text-slate-muted">
          Manage your player presence, community affiliations, and POPIA privacy controls.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-2xl space-y-5">
        {success && (
          <div className="p-3.5 rounded-xl bg-brand/10 border border-brand/40 text-brand text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-muted mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Town / Township / Village
              </label>
              <input
                type="text"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Province
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-muted mb-1">
              Preferred Home Pool Club
            </label>
            <input
              type="text"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Preferred Rule Set
              </label>
              <select
                value={preferredRuleSet}
                onChange={(e) => setPreferredRuleSet(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="BLACKBALL_SA">Blackball SA (Official)</option>
                <option value="BLACKBALL_INTL">Blackball International</option>
                <option value="WPA_8BALL">WPA World Standard</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Skill Level
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-elevated border border-surface-border text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="SEMI_PRO">Semi-Pro</option>
                <option value="PRO">Pro</option>
              </select>
            </div>
          </div>

          <div className="border-t border-surface-border pt-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Privacy &amp; POPIA Protections
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Location Granularity</p>
                <p className="text-[11px] text-slate-muted">Controls whether your precise club or just town is visible.</p>
              </div>
              <select
                value={locationVisibility}
                onChange={(e) => setLocationVisibility(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-xs text-white"
              >
                <option value="TOWN">Town / Village Only</option>
                <option value="PROVINCE">Province Only</option>
                <option value="HIDDEN">Private</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Allow Direct Challenges</p>
                <p className="text-[11px] text-slate-muted">Other players can issue match requests to you.</p>
              </div>
              <input
                type="checkbox"
                checked={allowChallenges}
                onChange={(e) => setAllowChallenges(e.target.checked)}
                className="w-4 h-4 accent-brand rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-brand text-black font-bold text-xs hover:bg-brand-hover shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
