"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface RuleArticle {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  officialRuleText: string;
  playerAdvice: string;
  foulPenalty: string;
  practicalExample: string;
  version: string;
  orderIndex: number;
}

interface QuizItem {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function RulesPage() {
  const [articles, setArticles] = useState<RuleArticle[]>([]);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  // Quiz state
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [rulesRes, quizRes] = await Promise.all([
          fetch("/api/rules"),
          fetch("/api/rules/quiz"),
        ]);

        if (rulesRes.ok) {
          const rData = await rulesRes.json();
          setArticles(rData.articles || []);
          if (rData.articles?.length > 0) {
            setExpandedSlug(rData.articles[0].slug);
          }
        }

        if (quizRes.ok) {
          const qData = await quizRes.json();
          setQuizList(qData.quiz || []);
        }
      } catch {}
    }
    loadData();
  }, []);

  const handleSelectAnswer = (qId: number, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleGradeQuiz = () => {
    let score = 0;
    quizList.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const filteredArticles =
    activeTab === "ALL"
      ? articles
      : articles.filter((a) => a.category === activeTab);

  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Blackball South Africa (BSA) &amp; WPA Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
          Official Rules &amp; Learning Library
        </h1>
        <p className="text-sm text-slate-muted leading-relaxed">
          The definitive rules handbook for competitive 8-ball in South Africa. Learn sanctioned procedures, dispel township street myths, and earn rule certification through the interactive quiz.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-surface-border pb-4">
        {[
          { id: "ALL", label: "All Topics" },
          { id: "BLACKBALL_SA", label: "Blackball South Africa" },
          { id: "HOUSE_RULES", label: "Street Myths vs Official" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-brand text-black font-bold shadow-glow"
                : "bg-surface-card text-slate-muted hover:text-white border border-surface-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rules Accordion / Article Cards */}
      <div className="space-y-4">
        {filteredArticles.map((article) => {
          const isExpanded = expandedSlug === article.slug;
          const isMyth = article.category === "HOUSE_RULES";

          return (
            <div
              key={article.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? isMyth
                    ? "bg-surface-card border-amber-500/50 shadow-lg"
                    : "bg-surface-card border-brand/40 shadow-glow"
                  : "bg-surface-card border-surface-border hover:border-brand/20"
              }`}
            >
              <button
                onClick={() => setExpandedSlug(isExpanded ? null : article.slug)}
                className="w-full p-5 text-left flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                      isMyth
                        ? "bg-amber-950/70 text-amber-400 border border-amber-700/50"
                        : "bg-brand/10 text-brand border border-brand/30"
                    }`}
                  >
                    #{article.orderIndex}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-muted mt-0.5 line-clamp-1">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="text-slate-muted">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-surface-border/60 space-y-4 text-xs">
                  {/* Official Rule text */}
                  <div className="p-4 rounded-xl bg-surface border border-surface-border/70 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-muted block tracking-wider">
                      Official Rule Regulation ({article.version})
                    </span>
                    <p className="text-white leading-relaxed text-xs">
                      {article.officialRuleText}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Player Advice */}
                    <div className="p-3.5 rounded-xl bg-brand/5 border border-brand/20 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-brand block">
                        Player Strategic Advice
                      </span>
                      <p className="text-slate-muted leading-relaxed">
                        {article.playerAdvice}
                      </p>
                    </div>

                    {/* Foul & Penalty */}
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-600/20 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">
                        Foul Penalty &amp; Award
                      </span>
                      <p className="text-slate-muted leading-relaxed">
                        {article.foulPenalty}
                      </p>
                    </div>
                  </div>

                  {/* Practical Match Scenario */}
                  <div className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-muted block">
                      Practical Table Scenario
                    </span>
                    <p className="text-white/90 leading-relaxed italic">
                      &quot;{article.practicalExample}&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Rules Certification Quiz Section */}
      <section id="quiz" className="p-6 sm:p-8 rounded-3xl bg-surface-card border border-brand/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-gold font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Interactive Player Certification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Blackball Rules Knowledge Test
            </h2>
            <p className="text-xs text-slate-muted">
              Answer the 5 scenario questions to verify your understanding of official BSA pool rules.
            </p>
          </div>

          {quizSubmitted && (
            <div className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-center">
              <span className="text-[10px] text-slate-muted uppercase font-bold block">Your Score</span>
              <span className="font-mono text-xl font-black text-brand">
                {quizScore} / {quizList.length}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {quizList.map((item, qIdx) => {
            const chosen = selectedAnswers[item.id];
            const isCorrect = chosen === item.correctIndex;

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-surface border border-surface-border space-y-3"
              >
                <p className="text-xs sm:text-sm font-bold text-white">
                  {qIdx + 1}. {item.question}
                </p>

                <div className="space-y-2">
                  {item.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    let optClass = "bg-surface-card border-surface-border text-slate-muted hover:text-white";

                    if (quizSubmitted) {
                      if (optIdx === item.correctIndex) {
                        optClass = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold";
                      } else if (isSelected && !isCorrect) {
                        optClass = "bg-red-950/60 border-red-500 text-red-200";
                      }
                    } else if (isSelected) {
                      optClass = "bg-brand/10 border-brand text-brand font-semibold shadow-glow";
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectAnswer(item.id, optIdx)}
                        className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${optClass}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && optIdx === item.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {quizSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="pt-2 text-[11px] text-slate-muted italic bg-surface-card p-2.5 rounded border border-surface-border/50">
                    <strong className="text-white not-italic">Official BSA Ruling:</strong> {item.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between">
          {quizSubmitted ? (
            <button
              onClick={handleResetQuiz}
              className="px-5 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-white text-xs font-semibold hover:border-brand/40"
            >
              Retake Quiz
            </button>
          ) : (
            <button
              onClick={handleGradeQuiz}
              disabled={Object.keys(selectedAnswers).length < quizList.length}
              className="px-6 py-3 rounded-xl bg-brand text-black font-extrabold text-xs hover:bg-brand-hover shadow-glow transition-all disabled:opacity-40"
            >
              Grade My Answers
            </button>
          )}

          <span className="text-[11px] text-slate-muted">
            {Object.keys(selectedAnswers).length} of {quizList.length} Answered
          </span>
        </div>
      </section>
    </div>
  );
}
