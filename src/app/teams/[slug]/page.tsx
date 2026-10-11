import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Shield,
  Users,
  MapPin,
  Trophy,
  ArrowLeft,
  ChevronRight,
  Flame,
  Award,
} from "lucide-react";

export const revalidate = 0;

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      captain: { include: { profile: true } },
      members: {
        include: {
          user: { include: { profile: true } },
        },
      },
      leagues: {
        include: { league: true },
      },
    },
  });

  if (!team) {
    notFound();
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <Link
        href="/teams"
        className="inline-flex items-center gap-1.5 text-xs text-slate-muted hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Teams Directory</span>
      </Link>

      {/* Team Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-surface-border bg-surface-card p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-brand/40 shadow-glow">
              <Image
                src={team.emblemUrl || "/assets/my8ball_logo.jpg"}
                alt={team.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-surface-elevated text-gold border border-gold/30">
                  {team.division} SQUAD
                </span>
                <span className="text-xs text-slate-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {team.town} · {team.homeVenue}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {team.name}
              </h1>

              <p className="text-xs text-slate-muted">
                Captain: <strong className="text-white">{team.captain.profile?.displayName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-surface-border">
            <div>
              <span className="text-[10px] text-slate-muted uppercase font-bold block">
                Team Rating
              </span>
              <span className="font-mono text-2xl font-black text-brand">
                {Math.round(team.rating)} ELO
              </span>
            </div>
            <div className="border-l border-surface-border pl-4">
              <span className="text-[10px] text-slate-muted uppercase font-bold block">
                Record
              </span>
              <span className="font-mono text-xl font-bold text-white">
                {team.wins}W - {team.losses}L
              </span>
            </div>
          </div>
        </div>

        {team.description && (
          <p className="mt-6 pt-4 border-t border-surface-border/60 text-xs text-slate-muted leading-relaxed">
            {team.description}
          </p>
        )}
      </div>

      {/* Roster & Squad Members Table */}
      <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-brand" />
            <span>Official Squad Roster</span>
          </h2>
          <span className="text-xs font-mono text-slate-muted">
            {team.members.length} Registered Members
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {team.members.map((m) => {
            const isCap = m.role === "CAPTAIN";
            return (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-surface border border-surface-border hover:border-brand/40 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center font-bold text-sm text-white">
                    {m.user.profile?.displayName[0]}
                  </div>
                  <div>
                    <Link
                      href={`/players/${m.user.profile?.username}`}
                      className="font-bold text-xs text-white hover:text-brand transition-colors block"
                    >
                      {m.user.profile?.displayName}
                    </Link>
                    <span className="text-[10px] font-mono text-slate-muted">
                      {m.user.profile?.rating} ELO
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    isCap
                      ? "bg-gold/10 text-gold border border-gold/30"
                      : "bg-surface-elevated text-slate-muted border border-surface-border"
                  }`}
                >
                  {m.role}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
