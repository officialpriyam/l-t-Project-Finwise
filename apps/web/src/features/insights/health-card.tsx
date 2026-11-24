"use client";

import { Gauge, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/features/app/app-context";
import { ProgressBar, Section, StatCard } from "@/features/app/blocks";
import { cn } from "@/shared/cn";
import { formatDay } from "@/shared/format";
import type { HealthAssessment, HealthComponent } from "./types";

const GRADE_TONE: Record<HealthAssessment["grade"], { text: string; ring: string; chip: string }> = {
  excellent: { text: "text-emerald-600 dark:text-emerald-400", ring: "var(--color-emerald-500)", chip: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  good: { text: "text-sky-600 dark:text-sky-400", ring: "var(--color-sky-500)", chip: "bg-sky-500/12 text-sky-700 dark:text-sky-300" },
  fair: { text: "text-amber-600 dark:text-amber-400", ring: "var(--color-amber-500)", chip: "bg-amber-500/12 text-amber-700 dark:text-amber-300" },
  at_risk: { text: "text-red-600 dark:text-red-400", ring: "var(--color-red-500)", chip: "bg-red-500/12 text-red-700 dark:text-red-300" },
};

const COMPONENT_HREF: Record<HealthComponent["key"], string> = {
  savings: "/reports?tab=summary",
  budgeting: "/budgets",
  debt: "/wealth/liabilities",
  emergency: "/accounts",
  fixed_costs: "/subscriptions",
};

/** A score drawn once on mount; reduced motion keeps it static. */
function ScoreRing({ score, grade, size = 116 }: { score: number; grade: HealthAssessment["grade"]; size?: number }) {
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const tone = GRADE_TONE[grade];
  const compact = size < 90;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 112 112" className="-rotate-90" width={size} height={size} role="img" aria-label={`Financial health ${score} out of 100`}>
        <circle cx="56" cy="56" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="8" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          fill="none"
          stroke={tone.ring}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - drawn / 100)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className={cn("font-semibold tabular-nums", compact ? "text-lg" : "text-3xl")}>{score}</span>
        {!compact && <span className="text-[10px] tracking-wide text-muted-foreground uppercase">of 100</span>}
      </div>
    </div>
  );
}

export function HealthPanel({ health }: { health: HealthAssessment }) {
  const { money } = useApp();
  const tone = GRADE_TONE[health.grade];
  return (
    <Section
      title="Financial health"
      hint={`Scored ${formatDay(health.asOf)} from posted activity, balances and budgets`}
      actions={<span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", tone.chip)}>{health.label}</span>}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <ScoreRing score={health.score} grade={health.grade} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm leading-relaxed">{health.summary}</p>
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
            <span>{money(health.metrics.netWorth)} net worth</span>
            <span>{money(health.metrics.liquidBalance)} spendable</span>
            {health.metrics.savingsRate !== null && <span>{health.metrics.savingsRate}% saved</span>}
          </p>
          {!health.metrics.complete && (
            <p className="text-xs text-amber-600 dark:text-amber-400">Some assets are missing an exchange rate, so debt and net worth read low.</p>
          )}
        </div>
      </div>

      <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {health.components.map((component) => (
          <li key={component.key}>
            <Link href={COMPONENT_HREF[component.key]} className="group block space-y-1 rounded-lg px-1 py-0.5">
              <span className="flex items-baseline justify-between gap-2 text-sm">
                <span className="truncate group-hover:underline group-hover:underline-offset-4">{component.label}</span>
                <span className={cn("shrink-0 font-medium tabular-nums", component.score >= 70 ? tone.text : component.score < 50 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400")}>
                  {Math.round(component.score)}
                </span>
              </span>
              <ProgressBar
                value={component.score}
                tone={component.score >= 70 ? "good" : component.score >= 50 ? "warn" : "danger"}
                className="h-1.5"
              />
              <span className="block text-[11px] text-muted-foreground">{component.detail}</span>
            </Link>
          </li>
        ))}
      </ul>

      {(health.improvements.length > 0 || health.strengths.length > 0) && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {health.improvements.slice(0, 2).map((line) => (
            <p key={line} className="flex gap-2 rounded-lg bg-amber-500/8 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              <TrendingUp className="mt-0.5 size-3.5 shrink-0" /> {line}
            </p>
          ))}
          {health.strengths.slice(0, 2).map((line) => (
            <p key={line} className="flex gap-2 rounded-lg bg-emerald-500/8 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" /> {line}
            </p>
          ))}
        </div>
      )}
    </Section>
  );
}

/** The dashboard's glanceable version: score, grade and the two things to fix. */
export function HealthSummaryCard({ health }: { health: HealthAssessment }) {
  const tone = GRADE_TONE[health.grade];
  return (
    <StatCard
      icon={Gauge}
      label="Financial health"
      value={`${health.score} · ${health.label}`}
      hint={health.improvements[0] ?? health.summary}
      href="/ai/insights"
      tone={health.grade === "excellent" || health.grade === "good" ? "good" : health.grade === "fair" ? "warn" : "danger"}
      valueClassName={tone.text}
    />
  );
}

/** A slim dashboard banner: the score, the grade and the first thing to improve. */
export function HealthStrip({ health }: { health: HealthAssessment }) {
  const tone = GRADE_TONE[health.grade];
  return (
    <Link
      href="/ai/insights"
      className="glass lift group flex items-center gap-4 rounded-xl px-4 py-3"
    >
      <ScoreRing score={health.score} grade={health.grade} size={64} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-2 text-sm font-medium">
          Financial health
          <span className={cn("rounded-full px-2 py-0.5 text-[11px]", tone.chip)}>{health.label}</span>
        </p>
        <p className="truncate text-xs text-muted-foreground">{health.improvements[0] ?? health.summary}</p>
      </div>
      <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground sm:flex">
        Full breakdown <TrendingUp className="size-3.5" />
      </span>
    </Link>
  );
}
