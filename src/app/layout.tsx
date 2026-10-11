import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import { ShieldCheck, Heart, Sparkles } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "My8ball | South Africa's Premier 8-Ball Pool Platform",
  description:
    "Challenge local players, compete in sanctioned Blackball leagues and tournaments, track your verified Elo rating, and earn community recognition across South Africa.",
  icons: {
    icon: "/assets/my8ball_logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="bg-background text-slate-text min-h-screen flex flex-col font-sans selection:bg-brand/30 selection:text-brand pb-24 lg:pb-0 overflow-x-hidden">
        <Navigation />

        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 min-w-0">
          {children}
        </main>

        <footer className="border-t border-surface-border bg-surface/80 py-10 text-xs text-slate-muted mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-display text-white tracking-tight">
                  MY<span className="text-brand">8</span>BALL
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                  BSA Standards
                </span>
              </div>
              <p className="text-slate-muted leading-relaxed">
                South Africa&apos;s community-driven 8-ball pool competition platform. Built for township clubs, village pool halls, and competitive league organizers.
              </p>
              <div className="flex items-center gap-2 text-slate-muted text-[11px]">
                <ShieldCheck className="w-4 h-4 text-brand" />
                <span>Verified Elo Ratings &amp; Anti-Tamper Records</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
                Competition
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/players" className="hover:text-white transition-colors">
                    Find Available Players
                  </Link>
                </li>
                <li>
                  <Link href="/challenges" className="hover:text-white transition-colors">
                    Challenge Match Hub
                  </Link>
                </li>
                <li>
                  <Link href="/matches" className="hover:text-white transition-colors">
                    Live Scoreboards
                  </Link>
                </li>
                <li>
                  <Link href="/rankings" className="hover:text-white transition-colors">
                    Provincial &amp; National Leaderboards
                  </Link>
                </li>
                <li>
                  <Link href="/teams" className="hover:text-white transition-colors">
                    Registered Teams
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
                Leagues &amp; Rules
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/leagues" className="hover:text-white transition-colors">
                    Community Leagues
                  </Link>
                </li>
                <li>
                  <Link href="/tournaments" className="hover:text-white transition-colors">
                    Tournaments &amp; Brackets
                  </Link>
                </li>
                <li>
                  <Link href="/rules" className="hover:text-white transition-colors">
                    Official Blackball SA Rules
                  </Link>
                </li>
                <li>
                  <Link href="/rules#myths" className="hover:text-white transition-colors">
                    Township Myths vs BSA Rules
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white transition-colors">
                    Organizer Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
                Community Hubs
              </h4>
              <p className="text-slate-muted leading-relaxed mb-3">
                Active in Mpheni, Elim, Thohoyandou, Soweto, Polokwane, and expanding across South Africa.
              </p>
              <div className="p-3 rounded-lg bg-surface-card border border-surface-border">
                <div className="flex items-center gap-1.5 text-brand font-semibold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fair Play Guarantee</span>
                </div>
                <p className="text-[11px] text-slate-muted mt-1">
                  Both players must confirm results to adjust Elo. Disputed frames are submitted to accredited referees.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-surface-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-muted">
              © 2026 My8ball SA. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-slate-muted">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span>·</span>
              <span className="hover:text-white cursor-pointer">Terms of Competition</span>
              <span>·</span>
              <span className="hover:text-white cursor-pointer">Support</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
