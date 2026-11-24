import { sum } from "../money.ts";

export type HealthGrade = "excellent" | "good" | "fair" | "at_risk";

export type HealthComponentKey = "savings" | "budgeting" | "debt" | "emergency" | "fixed_costs";

export type HealthComponent = {
  key: HealthComponentKey;
  label: string;
  /** 0–100 for this component alone. */
  score: number;
  /** Share of the overall score (0–1). */
  weight: number;
  /** The measured value the score comes from, e.g. 0.184 for an 18.4% savings rate. */
  value: number | null;
  detail: string;
};

export type HealthAssessment = {
  score: number;
  grade: HealthGrade;
  label: string;
  summary: string;
  components: HealthComponent[];
  strengths: string[];
  improvements: string[];
};

export type HealthInput = {
  /** Posted income per month, oldest first, in minor units. */
  monthlyIncome: number[];
  /** Posted expenses per month, oldest first, in minor units. */
  monthlyExpenses: number[];
  /** Spendable cash across bank, wallet and cash accounts. */
  liquidBalance: number;
  /** Outstanding debt (loans, credit cards, payables). */
  totalDebt: number;
  /** Everything owned that counts toward net worth. */
  totalAssets: number;
  /** Usual fixed obligations per month (rent, EMIs, subscriptions, payroll). */
  monthlyCommitments: number;
  /** Current period budgets and what has been spent against them. */
  budgets?: Array<{ amount: number; actual: number; exceeded?: boolean }>;
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const ratio = (part: number, whole: number) => (whole > 0 ? part / whole : 0);
const avg = (values: number[]) => (values.length ? sum(values) / values.length : 0);
const last = (values: number[], count: number) => values.slice(-count);

function gradeFor(score: number): HealthGrade {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "fair";
  return "at_risk";
}

const GRADE_LABELS: Record<HealthGrade, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Needs attention",
  at_risk: "At risk",
};

/**
 * A 0–100 financial health score from the last few months of activity and the
 * current balance sheet. Each component is scored on its own scale, then
 * weighted; components with no data (no budgets, no debt) are dropped and the
 * remaining weights renormalized so a missing input never drags the score down.
 */
export function financialHealth(input: HealthInput): HealthAssessment {
  const incomeMonths = last(input.monthlyIncome, 3).filter((value) => value > 0);
  const expenseMonths = last(input.monthlyExpenses, 3);
  const averageIncome = avg(incomeMonths);
  const averageExpenses = avg(expenseMonths);
  const savingsRate = averageIncome > 0 ? (averageIncome - averageExpenses) / averageIncome : null;

  const components: HealthComponent[] = [];

  if (savingsRate !== null) {
    // 20% of income kept is a full score; overspending scores zero.
    const score = clamp((savingsRate / 0.2) * 100);
    components.push({
      key: "savings",
      label: "Savings rate",
      score,
      weight: 0.3,
      value: Math.round(savingsRate * 1000) / 1000,
      detail:
        savingsRate >= 0
          ? `You keep ${(savingsRate * 100).toFixed(1)}% of income on average. 20% is a full score.`
          : `Spending runs ${(Math.abs(savingsRate) * 100).toFixed(1)}% above income on average.`,
    });
  }

  const budgets = input.budgets ?? [];
  if (budgets.length > 0) {
    const within = budgets.filter((budget) => budget.actual <= budget.amount && !budget.exceeded).length;
    const adherence = ratio(within, budgets.length);
    components.push({
      key: "budgeting",
      label: "Budget adherence",
      score: clamp(adherence * 100),
      weight: 0.15,
      value: Math.round(adherence * 1000) / 1000,
      detail:
        within === budgets.length
          ? `All ${budgets.length} budgets are within plan.`
          : `${within} of ${budgets.length} budgets are within plan; the rest are over their limit.`,
    });
  }

  // Debt-to-assets above 50% scores zero; no debt scores 100.
  const assets = Math.max(0, input.totalAssets);
  const debtRatio = input.totalDebt > 0 ? input.totalDebt / (input.totalDebt + assets) : 0;
  components.push({
    key: "debt",
    label: "Debt load",
    score: clamp((1 - debtRatio / 0.5) * 100),
    weight: 0.2,
    value: Math.round(debtRatio * 1000) / 1000,
    detail:
      input.totalDebt <= 0
        ? "No outstanding debt."
        : `${(debtRatio * 100).toFixed(1)}% of everything you own is financed by debt. Under 25% is healthy.`,
  });

  const monthlyBurn = averageExpenses > 0 ? averageExpenses : Math.max(0, input.monthlyCommitments);
  const emergencyMonths = monthlyBurn > 0 ? input.liquidBalance / monthlyBurn : null;
  components.push({
    key: "emergency",
    label: "Emergency fund",
    score: emergencyMonths === null ? 0 : clamp((emergencyMonths / 6) * 100),
    weight: 0.25,
    value: emergencyMonths === null ? null : Math.round(emergencyMonths * 10) / 10,
    detail:
      emergencyMonths === null
        ? "Not enough spending history to size an emergency fund."
        : `Spendable cash covers ${emergencyMonths.toFixed(1)} months of expenses. Six months is a full score.`,
  });

  if (averageIncome > 0 && input.monthlyCommitments > 0) {
    const fixedLoad = input.monthlyCommitments / averageIncome;
    components.push({
      key: "fixed_costs",
      label: "Fixed costs",
      score: clamp((1 - fixedLoad / 0.6) * 100),
      weight: 0.1,
      value: Math.round(fixedLoad * 1000) / 1000,
      detail: `Recurring commitments take ${(fixedLoad * 100).toFixed(1)}% of income. Under 35% leaves room to save.`,
    });
  }

  // Renormalize so the weights add to 1 whatever components are present.
  const totalWeight = components.reduce((total, component) => total + component.weight, 0) || 1;
  let score = 0;
  for (const component of components) {
    component.weight = Math.round((component.weight / totalWeight) * 1000) / 1000;
    score += component.score * (component.weight || 0);
  }
  const rounded = Math.round(clamp(score));
  const grade = gradeFor(rounded);

  const strengths = components.filter((component) => component.score >= 70).map((component) => component.detail);
  const improvements = components
    .filter((component) => component.score < 60)
    .sort((a, b) => a.score - b.score)
    .map((component) => component.detail);

  const summary =
    components.length === 0
      ? "Add a few transactions and budgets to see your financial health."
      : rounded >= 85
        ? "Your finances look strong. Keep the buffer funded and the fixed costs low."
        : rounded >= 70
          ? "You are in good shape. A little more saved each month would put you in excellent territory."
          : rounded >= 50
            ? "There is room to improve. Focus on the weakest area first; small changes compound."
            : "Several areas need attention. Start with an emergency buffer and a spending plan for the biggest category.";

  return {
    score: rounded,
    grade,
    label: GRADE_LABELS[grade],
    summary,
    components,
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
  };
}
