"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Users,
  Swords,
  Trophy,
  Shield,
  Medal,
  Calendar,
  BookOpen,
  Bell,
  User,
  Menu,
  X,
  Play,
  CheckCircle2,
  CircleDot,
  Radio,
  SlidersHorizontal,
  ChevronDown,
  LogOut,
  Flame,
} from "lucide-react";

interface CurrentUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
  availability?: {
    status: string;
    isAvailable: boolean;
  };
  profile?: {
    rating: number;
    division: string;
    town: string;
  };
}

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch current user session
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch {
        // guest mode
      }
    }
    loadUser();
  }, [pathname]);

  const toggleAvailability = async () => {
    if (!currentUser) return;
    setIsUpdatingStatus(true);
    const newStatus =
      currentUser.availability?.status === "AVAILABLE_INDIVIDUAL"
        ? "ONLINE_UNAVAILABLE"
        : "AVAILABLE_INDIVIDUAL";
    try {
      const res = await fetch("/api/players/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser((prev) =>
          prev
            ? {
                ...prev,
                availability: {
                  ...prev.availability,
                  status: updated.status,
                  isAvailable: updated.isAvailable,
                },
              }
            : null
        );
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const navLinks = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Find Players", href: "/players", icon: Users },
    { label: "Challenges", href: "/challenges", icon: Swords },
    { label: "Live Matches", href: "/matches", icon: Radio, badge: "LIVE" },
    { label: "Rankings", href: "/rankings", icon: Trophy },
    { label: "Teams", href: "/teams", icon: Shield },
    { label: "Leagues", href: "/leagues", icon: Medal },
    { label: "Tournaments", href: "/tournaments", icon: Calendar },
    { label: "Blackball Rules", href: "/rules", icon: BookOpen },
  ];

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center gap-2 sm:gap-6 min-w-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-brand/40 shadow-glow group-hover:border-brand transition-all shrink-0">
                <Image
                  src="/assets/my8ball_logo.jpg"
                  alt="My8ball Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-bold font-display tracking-tight text-white flex items-center gap-1 whitespace-nowrap">
                  MY<span className="text-brand">8</span>BALL
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-muted font-semibold -mt-1 whitespace-nowrap">
                  South Africa
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.slice(0, 7).map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-surface-elevated text-brand border border-brand/20 shadow-sm"
                        : "text-slate-muted hover:text-white hover:bg-surface-card"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-brand" : ""}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand/20 text-brand border border-brand/30 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Availability, Notifications, Profile / Auth */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                {/* Instant Availability Toggle */}
                <button
                  onClick={toggleAvailability}
                  disabled={isUpdatingStatus}
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    currentUser.availability?.status === "AVAILABLE_INDIVIDUAL"
                      ? "bg-brand/10 border-brand/40 text-brand shadow-glow hover:bg-brand/20"
                      : currentUser.availability?.status === "IN_MATCH"
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                      : "bg-surface-elevated border-surface-border text-slate-muted hover:text-white"
                  }`}
                  title="Toggle challenge availability"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentUser.availability?.status === "AVAILABLE_INDIVIDUAL"
                        ? "bg-brand animate-ping"
                        : currentUser.availability?.status === "IN_MATCH"
                        ? "bg-amber-400"
                        : "bg-slate-500"
                    }`}
                  />
                  <span>
                    {currentUser.availability?.status === "AVAILABLE_INDIVIDUAL"
                      ? "Available to Play"
                      : currentUser.availability?.status === "IN_MATCH"
                      ? "In a Match"
                      : "Unavailable"}
                  </span>
                </button>

                {/* Notifications Bell */}
                <Link
                  href="/notifications"
                  className="relative p-2 rounded-lg bg-surface-card border border-surface-border text-slate-muted hover:text-white hover:border-brand/30 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-[10px] font-bold text-black flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl bg-surface-card border border-surface-border hover:border-brand/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand/20 border border-brand/40 text-brand font-bold text-sm flex items-center justify-center">
                      {currentUser.displayName?.[0] || "P"}
                    </div>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-semibold text-white leading-tight">
                        {currentUser.displayName}
                      </span>
                      <span className="text-[10px] text-brand font-mono">
                        {currentUser.profile?.rating || 1200} ELO · {currentUser.profile?.town || "Mpheni"}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-muted" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-card border border-surface-border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="p-2 border-b border-surface-border mb-1">
                        <p className="text-xs text-slate-muted">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">
                          @{currentUser.username}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/30">
                          {currentUser.role}
                        </span>
                      </div>
                      <Link
                        href={`/players/${currentUser.username}`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-muted hover:text-white hover:bg-surface-elevated rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Player Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-muted hover:text-white hover:bg-surface-elevated rounded-lg transition-colors"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        Settings & Privacy
                      </Link>
                      {currentUser.role === "SUPER_ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 rounded-lg transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Portal
                        </Link>
                      )}
                      <div className="border-t border-surface-border my-1" />
                      <form action="/api/auth/logout" method="POST">
                        <button
                          type="submit"
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <Link
                  href="/auth/sign-in"
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-muted hover:text-white transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold bg-brand text-black hover:bg-brand-hover shadow-glow transition-all whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Join My8ball</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-surface-card border border-surface-border text-slate-muted hover:text-white shrink-0"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Full Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-surface-border bg-surface px-4 py-4 space-y-1 animate-in slide-in-from-top-4">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-surface-elevated text-brand border border-brand/20"
                      : "text-slate-muted hover:text-white hover:bg-surface-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${active ? "text-brand" : ""}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand/20 text-brand">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Primary thumb-friendly quick links) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-surface-border bg-surface/95 backdrop-blur-md px-1 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors shrink-0 ${
            pathname === "/dashboard" || pathname === "/"
              ? "text-brand font-bold"
              : "text-slate-muted hover:text-white"
          }`}
        >
          <Home className="w-5 h-5 shrink-0" />
          <span className="whitespace-nowrap">Home</span>
        </Link>
        <Link
          href="/players"
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors shrink-0 ${
            pathname === "/players" ? "text-brand font-bold" : "text-slate-muted hover:text-white"
          }`}
        >
          <Users className="w-5 h-5 shrink-0" />
          <span className="whitespace-nowrap">Find</span>
        </Link>
        <Link
          href="/challenges"
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium relative transition-colors shrink-0 ${
            pathname === "/challenges" ? "text-brand font-bold" : "text-slate-muted hover:text-white"
          }`}
        >
          <Swords className="w-5 h-5 shrink-0" />
          <span className="whitespace-nowrap">Challenges</span>
        </Link>
        <Link
          href="/matches"
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors shrink-0 ${
            pathname.startsWith("/matches") ? "text-brand font-bold" : "text-slate-muted hover:text-white"
          }`}
        >
          <Radio className="w-5 h-5 shrink-0" />
          <span className="whitespace-nowrap">Live</span>
        </Link>
        <Link
          href="/rankings"
          className={`flex flex-col items-center gap-0.5 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-colors shrink-0 ${
            pathname === "/rankings" ? "text-brand font-bold" : "text-slate-muted hover:text-white"
          }`}
        >
          <Trophy className="w-5 h-5 shrink-0" />
          <span className="whitespace-nowrap">Ranks</span>
        </Link>
      </nav>
    </>
  );
}
