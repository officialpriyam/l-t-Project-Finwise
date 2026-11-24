import type { Frequency, IntervalUnit } from "../constants.ts";
import type { Day } from "../dates.ts";
import { addMonths } from "../dates.ts";
import { monthsBetween } from "./budgets.ts";
import { monthlyEquivalent } from "./schedule.ts";
import { nameSimilarity, normalizeName } from "../text.ts";

export type BudgetRecommendation = {
  categoryId: string;
  name: string;
  /** Monthly spending used for the recommendation, oldest first. */
  history: number[];
  average: number;
  median: number;
  recommended: number;
  /** Recommended minus the average, as a share of the average. */
  change: number | null;
  rationale: string;
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round(((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2) : (sorted[middle] ?? 0);
}

/** Rounds up to a readable budget step (10 units under 1,000, 100 above). */
function roundBudget(value: number): number {
  const step = value >= 100_000 ? 10_000 : value >= 10_000 ? 1_000 : value >= 1_000 ? 100 : 10;
  return Math.ceil(value / step) * step;
}

/**
 * Where a budget should sit, from the last few months of spending in each
 * category: the median month (so one holiday or repair doesn't inflate it)
 * plus a small headroom, rounded to a readable figure.
 */
export function recommendBudgets(
  categories: Array<{ categoryId: string; name: string; monthly: Array<{ month: string; value: number }> }>,
  options: { months?: number; headroom?: number } = {},
): BudgetRecommendation[] {
  const months = options.months ?? 3;
  const headroom = options.headroom ?? 0.05;
  const recommendations: BudgetRecommendation[] = [];
  for (const category of categories) {
    const history = category.monthly.slice(-months).map((point) => Math.max(0, point.value));
    if (history.length === 0) continue;
    const med = median(history);
    if (med <= 0) continue;
    const average = Math.round(history.reduce((total, value) => total + value, 0) / history.length);
    const recommended = roundBudget(med * (1 + headroom));
    recommendations.push({
      categoryId: category.categoryId,
      name: category.name,
      history,
      average,
      median: med,
      recommended,
      change: average > 0 ? Math.round(((recommended - average) / average) * 1000) / 1000 : null,
      rationale:
        history.length >= 3
          ? `Median of the last ${history.length} months plus ${Math.round(headroom * 100)}% headroom.`
          : `Based on ${history.length} month${history.length === 1 ? "" : "s"} of spending plus ${Math.round(headroom * 100)}% headroom.`,
    });
  }
  return recommendations.sort((a, b) => b.recommended - a.recommended);
}

export type SubscriptionLike = {
  id: string;
  name: string;
  provider?: string | null;
  amount: number;
  currency: string;
  frequency: Frequency;
  intervalCount?: number | null;
  intervalUnit?: IntervalUnit | null;
  status?: string | null;
};

export type DuplicateSubscription = {
  aId: string;
  bId: string;
  aName: string;
  bName: string;
  score: number;
  reason: string;
  monthlyA: number;
  monthlyB: number;
  combinedMonthly: number;
};

function monthlyOf(item: SubscriptionLike): number {
  return monthlyEquivalent(item.amount, {
    frequency: item.frequency,
    intervalCount: item.intervalCount ?? undefined,
    intervalUnit: item.intervalUnit ?? undefined,
  });
}

/**
 * Two active subscriptions that look like the same service: same provider or
 * near-identical names, in the same currency, with monthly equivalents within
 * 15%. Catches "Netflix" entered twice under different plans instead of a
 * single subscription with a price change.
 */
export function findDuplicateSubscriptions(items: SubscriptionLike[]): DuplicateSubscription[] {
  const active = items.filter((item) => !item.status || item.status === "active" || item.status === "trialing");
  const results: DuplicateSubscription[] = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      if (!a || !b) continue;
      if (a.currency !== b.currency) continue;
      const providerMatch =
        Boolean(a.provider && b.provider && normalizeName(a.provider) === normalizeName(b.provider)) ||
        Boolean(a.provider && b.provider && nameSimilarity(a.provider, b.provider) >= 0.7);
      const similarity = nameSimilarity(a.name, b.name);
      if (!providerMatch && similarity < 0.6) continue;
      const monthlyA = monthlyOf(a);
      const monthlyB = monthlyOf(b);
      if (monthlyA <= 0 || monthlyB <= 0) continue;
      const difference = Math.abs(monthlyA - monthlyB) / Math.max(monthlyA, monthlyB);
      if (difference > 0.15) continue;
      const score = Math.min(1, Math.round((0.55 + (providerMatch ? 0.25 : 0) + similarity * 0.2 - difference) * 100) / 100);
      results.push({
        aId: a.id,
        bId: b.id,
        aName: a.name,
        bName: b.name,
        score,
        reason: providerMatch
          ? "Same provider and a nearly identical monthly cost."
          : "Nearly identical names and a nearly identical monthly cost.",
        monthlyA,
        monthlyB,
        combinedMonthly: monthlyA + monthlyB,
      });
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

export type GoalScenarioKey = "current" | "plus20" | "plus50" | "required" | "lump";

export type GoalScenario = {
  key: GoalScenarioKey;
  label: string;
  monthly: number;
  lumpSum: number;
  monthsToTarget: number | null;
  completionDate: Day | null;
  /** Against the goal's target date, when it has one. */
  onTime: boolean | null;
  balanceAtTarget: number | null;
};

export type GoalSimulation = {
  target: number;
  current: number;
  targetDate: Day | null;
  monthsLeft: number | null;
  requiredMonthly: number | null;
  /** Share of the goal already funded, percent. */
  progress: number;
  scenarios: GoalScenario[];
  assumptions: string[];
};

function firstMonthReaching(input: { target: number; current: number; monthly: number; lumpSum: number; rate: number }): number | null {
  if (input.current + input.lumpSum >= input.target) return 0;
  let balance = input.current + input.lumpSum;
  for (let month = 1; month <= 600; month++) {
    balance = balance * (1 + input.rate) + input.monthly;
    if (balance >= input.target) return month;
  }
  return null;
}

function balanceAfter(input: { current: number; monthly: number; lumpSum: number; rate: number; months: number }): number {
  let balance = input.current + input.lumpSum;
  for (let month = 0; month < input.months; month++) balance = balance * (1 + input.rate) + input.monthly;
  return Math.round(balance);
}

/**
 * What-if scenarios for a savings goal: the current plan, a 20% and 50%
 * lift, the monthly amount the deadline actually needs, and (when given) a
 * one-off contribution today. Returns the month each scenario reaches the
 * target and the balance at the deadline.
 */
export function simulateGoal(input: {
  target: number;
  current: number;
  monthlyPlan?: number | null;
  targetDate?: Day | null;
  today: Day;
  lumpSum?: number;
  annualReturnPct?: number;
}): GoalSimulation {
  const today = input.today;
  const target = Math.max(0, input.target);
  const current = Math.max(0, input.current);
  const monthly = Math.max(0, input.monthlyPlan ?? 0);
  const lumpSum = Math.max(0, input.lumpSum ?? 0);
  const rate = (1 + Math.max(0, input.annualReturnPct ?? 0) / 100) ** (1 / 12) - 1;
  const monthsLeft = input.targetDate ? Math.max(0, monthsBetween(today, input.targetDate)) : null;
  const remaining = Math.max(0, target - current);
  const growth = (1 + rate) ** (monthsLeft ?? 0);
  const requiredMonthly =
    remaining === 0
      ? 0
      : monthsLeft === null
        ? null
        : monthsLeft <= 0
          ? remaining
          : Math.ceil(rate > 0 ? ((target - current * growth) * rate) / (growth - 1) : remaining / monthsLeft);

  const plan = (key: GoalScenarioKey, label: string, scenarioMonthly: number, scenarioLump: number): GoalScenario => {
    const monthsToTarget = firstMonthReaching({ target, current, monthly: scenarioMonthly, lumpSum: scenarioLump, rate });
    const balanceAtTarget = monthsLeft === null ? null : balanceAfter({ current, monthly: scenarioMonthly, lumpSum: scenarioLump, rate, months: Math.floor(monthsLeft) });
    return {
      key,
      label,
      monthly: Math.round(scenarioMonthly),
      lumpSum: Math.round(scenarioLump),
      monthsToTarget,
      completionDate: monthsToTarget === null ? null : addMonths(today, monthsToTarget),
      onTime: monthsLeft === null || monthsToTarget === null ? null : monthsToTarget <= monthsLeft,
      balanceAtTarget,
    };
  };

  const scenarios: GoalScenario[] = [plan("current", "Current plan", monthly, 0), plan("plus20", "Save 20% more", Math.round(monthly * 1.2), 0), plan("plus50", "Save 50% more", Math.round(monthly * 1.5), 0)];
  if (requiredMonthly !== null) scenarios.push(plan("required", "On-time plan", requiredMonthly, 0));
  if (lumpSum > 0) scenarios.push(plan("lump", "One extra payment", monthly, lumpSum));

  return {
    target,
    current,
    targetDate: input.targetDate ?? null,
    monthsLeft: monthsLeft === null ? null : Math.round(monthsLeft * 10) / 10,
    requiredMonthly,
    progress: target > 0 ? Math.round((current / target) * 1000) / 10 : 0,
    scenarios,
    assumptions: [
      "Contributions are added at the end of each month.",
      "Any annual return is assumed constant and compounded monthly.",
      "Changing your plan does not alter the goal itself; it is a projection only.",
    ],
  };
}
