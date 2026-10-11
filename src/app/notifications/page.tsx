import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  Bell,
  Swords,
  Clock,
  Trophy,
  Award,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const revalidate = 0;

export default async function NotificationsPage() {
  const session = await getSessionUser();

  const notifications = session
    ? await prisma.notification.findMany({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
      })
    : await prisma.notification.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
      });

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Notifications Centre
          </h1>
          <p className="text-xs text-slate-muted">
            Match invites, confirmation requests, tournament updates, and unlocked achievements.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-muted">
          {notifications.length} Events
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-card border border-surface-border space-y-2">
          <Bell className="w-10 h-10 text-slate-muted mx-auto" />
          <h3 className="text-base font-bold text-white">No notifications yet</h3>
          <p className="text-xs text-slate-muted">
            You will be notified when players challenge you or match scores require confirmation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isChallenge = n.type.includes("CHALLENGE");
            const isConfirm = n.type.includes("CONFIRMATION");
            const isTrophy = n.type.includes("ACHIEVEMENT");

            return (
              <div
                key={n.id}
                className="p-4 rounded-2xl bg-surface-card border border-surface-border hover:border-brand/40 transition-all flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isChallenge
                        ? "bg-brand/10 text-brand border border-brand/30"
                        : isConfirm
                        ? "bg-amber-950/60 text-amber-400 border border-amber-600/40"
                        : isTrophy
                        ? "bg-gold/10 text-gold border border-gold/30"
                        : "bg-surface-elevated text-white"
                    }`}
                  >
                    {isChallenge && <Swords className="w-4 h-4" />}
                    {isConfirm && <Clock className="w-4 h-4" />}
                    {isTrophy && <Trophy className="w-4 h-4" />}
                    {!isChallenge && !isConfirm && !isTrophy && <Bell className="w-4 h-4" />}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white">{n.title}</h3>
                    <p className="text-xs text-slate-muted mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-muted/70 block mt-1">
                      {new Date(n.createdAt).toLocaleDateString()} at{" "}
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {n.link && (
                  <Link
                    href={n.link}
                    className="px-3 py-1.5 rounded-lg bg-surface-elevated text-xs font-semibold text-brand hover:bg-brand hover:text-black transition-all shrink-0 flex items-center gap-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
