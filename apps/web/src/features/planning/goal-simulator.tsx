"use client";

import { formatDay, minorToInput, parseMoneyInput } from "@finwise/core";
import { CalendarCheck, Loader2, Rocket, SlidersHorizontal, Sparkles } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useApp } from "@/features/app/app-context";
import { EmptyNote, ProgressBar, Section } from "@/features/app/blocks";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { clientApi, errorMessage } from "@/shared/api/client";
import type { GoalDetail } from "@/shared/api/types/planning";
import { cn } from "@/shared/cn";
import type { GoalScenario, GoalSimulation } from "@/features/insights/types";

const RETURNS = [0, 5, 8, 12];

/** What-if planning for a goal: change the monthly amount or add a lump sum and see when it lands. */
export function GoalSimulator({ goal }: { goal: GoalDetail }) {
  const { money } = useApp();
  const [monthly, setMonthly] = useState(minorToInput(goal.monthlyPlan ?? 0, goal.currency));
  const [lump, setLump] = useState("");
  const [rate, setRate] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GoalSimulation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (monthlyValue: string, lumpValue: string, returnPct: number) => {
    setBusy(true);
    setError(null);
    try {
      const monthlyPlan = monthlyValue.trim() ? (parseMoneyInput(monthlyValue, goal.currency) ?? 0) : 0;
      const lumpSum = lumpValue.trim() ? (parseMoneyInput(lumpValue, goal.currency) ?? 0) : 0;
      const simulation = await clientApi<GoalSimulation>(`/goals/${goal.id}/simulate`, {
        method: "POST",
        body: { monthlyPlan, lumpSum, annualReturnPct: returnPct },
      });
      setResult(simulation);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // Start from the goal's own plan so the section is useful before anyone touches it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once per goal
  useEffect(() => {
    void run(minorToInput(goal.monthlyPlan ?? 0, goal.currency), "", 0);
  }, [goal.id]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void run(monthly, lump, rate);
  };

  return (
    <Section
      title="What if?"
      hint="Change the plan and see when the goal lands. Nothing is saved; this is a projection."
      actions={<SlidersHorizontal className="size-4 text-muted-foreground" />}
    >
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end">
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">Save each month ({goal.currency})</span>
          <Input value={monthly} onChange={(e) => setMonthly(e.target.value)} inputMode="decimal" placeholder="0" aria-label="Monthly amount" />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">One extra payment ({goal.currency})</span>
          <Input value={lump} onChange={(e) => setLump(e.target.value)} inputMode="decimal" placeholder="0" aria-label="Lump sum" />
        </label>
        <div className="space-y-1 text-xs">
          <span className="text-muted-foreground">Annual return</span>
          <div className="flex rounded-lg border border-border p-0.5">
            {RETURNS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={rate === value}
                onClick={() => setRate(value)}
                className={cn(
                  "flex-1 rounded-md px-1.5 py-1 text-xs transition-colors",
                  rate === value ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value}%
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Rocket className="size-3.5" />} Simulate
        </Button>
      </form>

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      {result ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Figure label="Months left" value={result.monthsLeft === null ? "No date" : `${result.monthsLeft}`} />
            <Figure
              label="Needed per month"
              value={result.requiredMonthly === null ? "Set a date" : money(result.requiredMonthly, result.currency)}
              hint={result.targetDate ? `to finish by ${formatDay(result.targetDate, "short")}` : undefined}
            />
            <Figure label="Target" value={money(result.target, result.currency)} hint={`${result.progress}% funded`} />
            <Figure
              label="On-time plan"
              value={
                result.scenarios.find((scenario) => scenario.key === "required")?.monthly !== undefined
                  ? money(result.scenarios.find((scenario) => scenario.key === "required")?.monthly ?? 0, result.currency)
                  : "—"
              }
              hint="each month"
            />
          </div>

          <ul className="divide-y divide-border">
            {result.scenarios.map((scenario) => (
              <ScenarioRow key={scenario.key} scenario={scenario} currency={result.currency} target={result.target} />
            ))}
          </ul>
          <ul className="space-y-1 text-[11px] text-muted-foreground">
            {result.assumptions.map((line) => (
              <li key={line} className="flex gap-1.5">
                <Sparkles className="mt-0.5 size-3 shrink-0" /> {line}
              </li>
            ))}
          </ul>
        </>
      ) : (
        !busy && <EmptyNote>Run a simulation to see how the goal responds to a different plan.</EmptyNote>
      )}
    </Section>
  );
}

function Figure({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-white/50 bg-card/40 px-3 py-2 backdrop-blur-sm dark:border-white/10">
      <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold tabular-nums">{value}</p>
      {hint && <p className="truncate text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ScenarioRow({ scenario, currency, target }: { scenario: GoalScenario; currency: string; target: number }) {
  const { money } = useApp();
  const badge = scenario.onTime === null ? { text: "No deadline", tone: "bg-muted text-muted-foreground" } : scenario.onTime ? { text: "On time", tone: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" } : { text: "Late", tone: "bg-amber-500/12 text-amber-700 dark:text-amber-300" };
  return (
    <li className="flex flex-wrap items-center gap-3 py-2.5">
      <CalendarCheck className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{scenario.label}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {money(scenario.monthly, currency)}/mo{scenario.lumpSum > 0 ? ` + ${money(scenario.lumpSum, currency)} once` : ""}
          {scenario.monthsToTarget !== null ? ` · ${scenario.monthsToTarget} month${scenario.monthsToTarget === 1 ? "" : "s"}` : ""}
        </p>
        {scenario.balanceAtTarget !== null && (
          <div className="mt-1 max-w-48">
            <ProgressBar value={Math.min(100, (scenario.balanceAtTarget / Math.max(1, target)) * 100)} className="h-1" />
          </div>
        )}
      </div>
      <div className="text-right">
        <p className="text-sm font-medium tabular-nums">{scenario.completionDate ? formatDay(scenario.completionDate) : "Not reached"}</p>
        <span className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px]", badge.tone)}>{badge.text}</span>
      </div>
    </li>
  );
}
