// Read models behind the intelligence panels. Every figure is computed in the
// API from posted ledger data; the panels only present them.

export type MonthPoint = { month: string; income: number; expenses: number; net: number };
export type MonthlyValue = { month: string; value: number };

export type HealthComponent = {
  key: "savings" | "budgeting" | "debt" | "emergency" | "fixed_costs";
  label: string;
  score: number;
  weight: number;
  value: number | null;
  detail: string;
};

export type HealthAssessment = {
  score: number;
  grade: "excellent" | "good" | "fair" | "at_risk";
  label: string;
  summary: string;
  components: HealthComponent[];
  strengths: string[];
  improvements: string[];
  currency: string;
  asOf: string;
  history: MonthPoint[];
  metrics: {
    averageIncome: number;
    averageExpenses: number;
    savingsRate: number | null;
    liquidBalance: number;
    totalDebt: number;
    totalAssets: number;
    netWorth: number;
    monthlyCommitments: number;
    commitments: number;
    spendingAccounts: number;
    budgets: { count: number; over: number };
    complete: boolean;
  };
};

export type ForecastPoint = { month: string; forecast: number; low: number; high: number };

export type ExpenseForecast = {
  currency: string;
  label: "estimate";
  history: MonthlyValue[];
  averageMonthly: number;
  forecast: {
    points: ForecastPoint[];
    total: number;
    method: "trend+seasonality" | "trend" | "average";
    confidence: number;
    trendPerMonth: number;
    backtest: { months: number; mae: number; mape: number | null; accuracy: number | null } | null;
    assumptions: string[];
  };
  byCategory: Array<{
    categoryId: string;
    name: string;
    icon: string | null;
    color: string | null;
    history: MonthlyValue[];
    recentTotal: number;
    forecast: ExpenseForecast["forecast"];
  }>;
  note: string;
};

export type BudgetRecommendation = {
  categoryId: string;
  name: string;
  history: number[];
  average: number;
  median: number;
  recommended: number;
  change: number | null;
  rationale: string;
  icon: string | null;
  color: string | null;
  currentBudget: number | null;
};

export type BudgetRecommendations = {
  currency: string;
  months: number;
  recommendations: BudgetRecommendation[];
  totals: { recommended: number; current: number; count: number; missing: number };
  methodology: string;
};

export type SpendingSegment = {
  key: string;
  label: string;
  color: string;
  merchants: number;
  transactions: number;
  monthlyTotal: number;
  share: number;
  averageTicket: number;
  perMonth: number;
  recencyDays: number;
  top: Array<{ name: string; total: number; count: number; href: string }>;
};

export type Segments = {
  currency: string;
  asOf: string;
  windowDays: number;
  segments: SpendingSegment[];
  note: string;
};

export type Spike = {
  kind: string;
  key: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
  expected: number;
  actual: number;
  percent: number | null;
  transactionIds: string[];
};

export type AnomalyScan = {
  currency: string;
  asOf: string;
  windowDays: number;
  scanned: number;
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
    currency: string;
    merchant: string;
    categoryName: string | null;
    score: number;
    ratio: number;
    reason: string;
    href: string;
  }>;
  spikes: Spike[];
  duplicates: Array<{
    a: { id: string; date: string; amount: number; merchant: string | null };
    b: { id: string; date: string; amount: number; merchant: string | null };
    score: number;
    reasons: string[];
    currency: string;
  }>;
  counts: { transactions: number; spikes: number; duplicates: number };
};

export type SubscriptionDuplicates = {
  baseCurrency: string;
  duplicates: Array<{
    aId: string;
    bId: string;
    aName: string;
    bName: string;
    score: number;
    reason: string;
    monthlyA: number;
    monthlyB: number;
    combinedMonthly: number;
    aHref: string;
    bHref: string;
    aMonthlyBase: number | null;
    bMonthlyBase: number | null;
    savingsBase: number | null;
  }>;
  potentialMonthly: number;
  activeCount: number;
};

export type GoalScenario = {
  key: "current" | "plus20" | "plus50" | "required" | "lump";
  label: string;
  monthly: number;
  lumpSum: number;
  monthsToTarget: number | null;
  completionDate: string | null;
  onTime: boolean | null;
  balanceAtTarget: number | null;
};

export type GoalSimulation = {
  goalId: string;
  name: string;
  currency: string;
  target: number;
  current: number;
  targetDate: string | null;
  monthsLeft: number | null;
  requiredMonthly: number | null;
  progress: number;
  scenarios: GoalScenario[];
  assumptions: string[];
};
