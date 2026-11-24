import {
  addDays,
  addMonths,
  detectSpikes,
  diffDays,
  eachMonth,
  endOfMonth,
  financialHealth,
  findDuplicateSubscriptions,
  formatMoney,
  forecastExpenses,
  type Frequency,
  type IntervalUnit,
  isolationForest,
  kMeans,
  monthlyEquivalent,
  recommendBudgets,
  scoreDuplicate,
  type SeriesPoint,
  startOfMonth,
  standardize,
} from "@finwise/core";
import { Inject, Injectable } from "@nestjs/common";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { todayFor, type WorkspaceContext } from "../../kernel/context.js";
import { db } from "../../platform/data/index.js";
import { categories, commitments, counterparties, transactions } from "../../platform/data/schema/index.js";
import { AccountsService } from "../accounting/accounts.service.js";
import { FxService } from "../accounting/fx.service.js";
import { BudgetsService } from "../planning/budgets.service.js";
import { SubscriptionsService } from "../planning/subscriptions.service.js";
import { NetWorthService } from "../wealth/net-worth.service.js";
import { AnalyticsService } from "./analytics.service.js";

const LIQUID_KINDS = new Set(["bank", "cash", "mobile_wallet", "digital_wallet", "payment_processor", "savings"]);
const SEGMENT_COLORS = ["#7c9cff", "#8ef0c9", "#ffd479", "#ff9db1", "#b79cff"];

type CategoryMonth = {
  categoryId: string;
  name: string;
  icon: string | null;
  color: string | null;
  monthly: Array<{ month: string; value: number }>;
  total: number;
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round(((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2) : (sorted[middle] ?? 0);
}

function mean(values: number[]): number {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

/**
 * The "intelligence" read models: health score, expense forecast, budget
 * recommendations, spending segments, anomalies and duplicate subscriptions.
 * Every figure is computed from posted ledger data in the base currency; the
 * score and forecasts carry their inputs and assumptions so the UI can show
 * how each number was reached.
 */
@Injectable()
export class InsightsService {
  constructor(
    @Inject(AnalyticsService) private readonly analytics: AnalyticsService,
    @Inject(AccountsService) private readonly accounts: AccountsService,
    @Inject(FxService) private readonly fx: FxService,
    @Inject(NetWorthService) private readonly netWorthService: NetWorthService,
    @Inject(BudgetsService) private readonly budgets: BudgetsService,
    @Inject(SubscriptionsService) private readonly subscriptions: SubscriptionsService,
  ) {}

  private async toBase(ctx: WorkspaceContext, amount: number, currency: string) {
    return currency === ctx.baseCurrency ? amount : this.fx.tryConvert(amount, currency, ctx.baseCurrency, todayFor(ctx), ctx.workspaceId);
  }

  /** Expenses per rolled-up category per month, gaps filled, oldest first. */
  private async categoryMonthly(ctx: WorkspaceContext, months: number) {
    const today = todayFor(ctx);
    const from = startOfMonth(addMonths(today, -(months - 1)));
    const to = endOfMonth(today);
    const rows = await db
      .select({
        categoryId: transactions.categoryId,
        month: sql<string>`to_char(${transactions.date}::date, 'YYYY-MM')`,
        amount: sql<string>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.baseAmount} when ${transactions.type} = 'refund' and ${transactions.direction} = 'in' then -${transactions.baseAmount} else 0 end), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.workspaceId, ctx.workspaceId),
          eq(transactions.status, "posted"),
          sql`${transactions.type} in ('expense', 'refund')`,
          gte(transactions.date, from),
          lte(transactions.date, to),
        ),
      )
      .groupBy(transactions.categoryId, sql`to_char(${transactions.date}::date, 'YYYY-MM')`);
    const all = await db.select().from(categories).where(eq(categories.workspaceId, ctx.workspaceId));
    const byId = new Map(all.map((category) => [category.id, category]));
    const buckets = new Map<string, Map<string, number>>();
    for (const row of rows) {
      const category = row.categoryId ? byId.get(row.categoryId) : undefined;
      const key = category?.parentId ?? row.categoryId ?? "uncategorized";
      const bucket = buckets.get(key) ?? new Map<string, number>();
      bucket.set(row.month, (bucket.get(row.month) ?? 0) + Number(row.amount));
      buckets.set(key, bucket);
    }
    const monthList = eachMonth(from, to);
    const items: CategoryMonth[] = [...buckets.entries()]
      .map(([key, bucket]) => {
        const category = key === "uncategorized" ? null : byId.get(key);
        const monthly = monthList.map((month) => ({ month, value: Math.max(0, Math.round(bucket.get(month) ?? 0)) }));
        return {
          categoryId: key,
          name: category?.name ?? "Uncategorized",
          icon: category?.icon ?? null,
          color: category?.color ?? null,
          monthly,
          total: monthly.reduce((total, point) => total + point.value, 0),
        };
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
    return { months: monthList, items };
  }

  /** The last N completed months (the current, partial month is dropped). */
  private completed<T>(points: T[]): T[] {
    return points.length > 1 ? points.slice(0, -1) : points;
  }

  // ------------------------------------------------------------------ health

  async health(ctx: WorkspaceContext) {
    const today = todayFor(ctx);
    const [monthly, accounts, netWorth, budgetList] = await Promise.all([
      this.analytics.monthly(ctx, 13),
      this.accounts.list(ctx),
      this.netWorthService.summary(ctx),
      this.budgets.list(ctx),
    ]);
    const completed = this.completed(monthly);

    const liquid = accounts.filter((account) => account.includeInNetWorth && !account.isLiability && LIQUID_KINDS.has(account.kind));
    const liquidBalance = liquid.reduce((total, account) => total + Math.max(0, account.baseBalance ?? 0), 0);

    const activeCommitments = await db
      .select()
      .from(commitments)
      .where(and(eq(commitments.workspaceId, ctx.workspaceId), eq(commitments.status, "active"), eq(commitments.direction, "out")));
    let monthlyCommitments = 0;
    for (const commitment of activeCommitments) {
      const monthlyEquivalentAmount = monthlyEquivalent(commitment.amount, {
        frequency: commitment.frequency as Frequency,
        intervalCount: commitment.intervalCount,
        intervalUnit: (commitment.intervalUnit ?? undefined) as IntervalUnit | undefined,
      });
      monthlyCommitments += (await this.toBase(ctx, monthlyEquivalentAmount, commitment.currency)) ?? 0;
    }

    const budgetSnapshot = budgetList.items
      .filter((budget) => budget.inEffect)
      .map((budget) => ({ name: budget.name, amount: budget.amount, actual: budget.metrics.actual, exceeded: budget.metrics.status === "over" }));

    const assessment = financialHealth({
      monthlyIncome: completed.map((point) => point.income),
      monthlyExpenses: completed.map((point) => point.expenses),
      liquidBalance,
      totalDebt: netWorth.liabilities.total,
      totalAssets: netWorth.assets.total,
      monthlyCommitments,
      budgets: budgetSnapshot.map((budget) => ({ amount: budget.amount, actual: budget.actual, exceeded: budget.exceeded })),
    });

    const lastThree = completed.slice(-3);
    const averageIncome = Math.round(mean(lastThree.map((point) => point.income)));
    const averageExpenses = Math.round(mean(lastThree.map((point) => point.expenses)));

    return {
      ...assessment,
      currency: ctx.baseCurrency,
      asOf: today,
      history: completed.slice(-12),
      metrics: {
        averageIncome,
        averageExpenses,
        savingsRate: averageIncome > 0 ? Math.round(((averageIncome - averageExpenses) / averageIncome) * 1000) / 10 : null,
        liquidBalance,
        totalDebt: netWorth.liabilities.total,
        totalAssets: netWorth.assets.total,
        netWorth: netWorth.netWorth,
        monthlyCommitments: Math.round(monthlyCommitments),
        commitments: activeCommitments.length,
        spendingAccounts: liquid.length,
        budgets: { count: budgetSnapshot.length, over: budgetSnapshot.filter((budget) => budget.exceeded).length },
        complete: netWorth.complete,
      },
    };
  }

  // --------------------------------------------------------------- forecasts

  async expenseForecast(ctx: WorkspaceContext, months: number) {
    const [monthly, categoryData] = await Promise.all([this.analytics.monthly(ctx, 13), this.categoryMonthly(ctx, 13)]);
    const history = this.completed(monthly).map((point) => ({ month: point.month, value: point.expenses }));
    const forecast = forecastExpenses({ history, horizon: months });
    const completedMonths = this.completed(categoryData.months);
    const byCategory = categoryData.items.slice(0, 8).map((item) => {
      const values = item.monthly.filter((point) => completedMonths.includes(point.month));
      return {
        categoryId: item.categoryId,
        name: item.name,
        icon: item.icon,
        color: item.color,
        history: values,
        recentTotal: values.slice(-3).reduce((total, point) => total + point.value, 0),
        forecast: forecastExpenses({ history: values, horizon: months }),
      };
    });
    return {
      currency: ctx.baseCurrency,
      label: "estimate" as const,
      history,
      averageMonthly: Math.round(mean(history.map((point) => point.value))),
      forecast,
      byCategory,
      note: "Only completed months are used; the current partial month is excluded.",
    };
  }

  // --------------------------------------------------------- recommendations

  async budgetRecommendations(ctx: WorkspaceContext) {
    const [categoryData, budgetList] = await Promise.all([this.categoryMonthly(ctx, 7), this.budgets.list(ctx)]);
    const completedMonths = this.completed(categoryData.months).slice(-6);
    const currentByCategory = new Map(
      budgetList.items.filter((budget) => budget.inEffect && budget.categoryId).map((budget) => [budget.categoryId as string, budget.amount]),
    );
    const recommendations = recommendBudgets(
      categoryData.items
        .filter((item) => item.categoryId !== "uncategorized")
        .map((item) => ({
          categoryId: item.categoryId,
          name: item.name,
          monthly: completedMonths.map((month) => ({ month, value: item.monthly.find((point) => point.month === month)?.value ?? 0 })),
        })),
      { months: 3 },
    ).map((recommendation) => ({
      ...recommendation,
      icon: categoryData.items.find((item) => item.categoryId === recommendation.categoryId)?.icon ?? null,
      color: categoryData.items.find((item) => item.categoryId === recommendation.categoryId)?.color ?? null,
      currentBudget: currentByCategory.get(recommendation.categoryId) ?? null,
    }));

    return {
      currency: ctx.baseCurrency,
      months: 3,
      recommendations,
      totals: {
        recommended: recommendations.reduce((total, recommendation) => total + recommendation.recommended, 0),
        current: recommendations.reduce((total, recommendation) => total + (recommendation.currentBudget ?? 0), 0),
        count: recommendations.length,
        missing: recommendations.filter((recommendation) => recommendation.currentBudget === null).length,
      },
      methodology: "Each budget is the median of the last three completed months plus 5% headroom, rounded up.",
    };
  }

  // ---------------------------------------------------------------- segments

  async segments(ctx: WorkspaceContext) {
    const today = todayFor(ctx);
    const windowDays = 180;
    const monthsWindow = windowDays / 30;
    const rows = await db
      .select({
        key: sql<string>`coalesce(${transactions.counterpartyId}::text, lower(coalesce(${transactions.merchant}, 'unknown')))`,
        name: sql<string>`coalesce(${counterparties.name}, ${transactions.merchant}, 'Unknown')`,
        count: sql<number>`count(*)::int`,
        total: sql<string>`sum(${transactions.baseAmount})`,
        average: sql<string>`avg(${transactions.baseAmount})`,
        last: sql<string>`max(${transactions.date})`,
      })
      .from(transactions)
      .leftJoin(counterparties, eq(counterparties.id, transactions.counterpartyId))
      .where(
        and(
          eq(transactions.workspaceId, ctx.workspaceId),
          eq(transactions.status, "posted"),
          eq(transactions.type, "expense"),
          gte(transactions.date, addDays(today, -windowDays)),
          sql`${transactions.baseAmount} > 0`,
        ),
      )
      .groupBy(sql`1`, sql`2`)
      .having(sql`count(*) >= 2`)
      .orderBy(sql`sum(${transactions.baseAmount}) desc`)
      .limit(80);

    if (rows.length < 4) {
      return {
        currency: ctx.baseCurrency,
        asOf: today,
        windowDays,
        segments: [],
        note: "Not enough repeat merchants yet. Segments appear after a few weeks of spending.",
      };
    }

    const merchants = rows.map((row) => {
      const total = Number(row.total);
      return {
        name: row.name,
        total,
        monthly: total / monthsWindow,
        count: row.count,
        average: Number(row.average),
        recency: diffDays(String(row.last), today),
      };
    });
    const overallAverage = mean(merchants.map((merchant) => merchant.average));
    const overallPerMonth = mean(merchants.map((merchant) => merchant.count)) / monthsWindow;
    const totalMonthly = merchants.reduce((total, merchant) => total + merchant.monthly, 0);

    const standardized = standardize(
      merchants.map((merchant) => [Math.log1p(merchant.monthly), merchant.count / monthsWindow, Math.log1p(merchant.average), merchant.recency]),
    );
    const clusters = Math.min(4, new Set(merchants.map((merchant) => `${Math.round(merchant.monthly)}:${merchant.count}`)).size);
    const result = kMeans(standardized.points, Math.max(1, clusters), { seed: 11 });

    const groups = new Map<number, typeof merchants>();
    result.assignments.forEach((cluster, index) => {
      const merchant = merchants[index];
      if (!merchant) return;
      const list = groups.get(cluster) ?? [];
      list.push(merchant);
      groups.set(cluster, list);
    });

    const used = new Set<string>();
    const labelFor = (group: { average: number; perMonth: number; recency: number }) => {
      let label: string;
      if (group.average >= overallAverage * 1.5) label = "Big-ticket";
      else if (group.perMonth >= overallPerMonth * 1.3) label = "Frequent small";
      else if (group.recency <= 21) label = "Regulars";
      else label = "Occasional";
      if (used.has(label)) {
        let suffix = 2;
        while (used.has(`${label} ${suffix}`)) suffix++;
        label = `${label} ${suffix}`;
      }
      used.add(label);
      return label;
    };

    const segments = [...groups.entries()]
      .map(([cluster, list]) => {
        const monthlyTotal = list.reduce((total, merchant) => total + merchant.monthly, 0);
        const count = list.reduce((total, merchant) => total + merchant.count, 0);
        const average = count > 0 ? list.reduce((total, merchant) => total + merchant.total, 0) / count : 0;
        const perMonth = count / monthsWindow;
        const recency = Math.min(...list.map((merchant) => merchant.recency));
        return {
          key: String(cluster),
          label: labelFor({ average, perMonth, recency }),
          color: SEGMENT_COLORS[cluster % SEGMENT_COLORS.length] ?? SEGMENT_COLORS[0],
          merchants: list.length,
          transactions: count,
          monthlyTotal: Math.round(monthlyTotal),
          share: totalMonthly > 0 ? Math.round((monthlyTotal / totalMonthly) * 1000) / 10 : 0,
          averageTicket: Math.round(average),
          perMonth: Math.round(perMonth * 10) / 10,
          recencyDays: recency,
          top: [...list]
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
            .map((merchant) => ({
              name: merchant.name,
              total: Math.round(merchant.total),
              count: merchant.count,
              href: `/transactions?q=${encodeURIComponent(merchant.name)}`,
            })),
        };
      })
      .sort((a, b) => b.monthlyTotal - a.monthlyTotal);

    return { currency: ctx.baseCurrency, asOf: today, windowDays, segments, note: `K-Means over ${merchants.length} merchants by spend, frequency, ticket size and recency.` };
  }

  // --------------------------------------------------------------- anomalies

  async anomalies(ctx: WorkspaceContext, days: number) {
    const today = todayFor(ctx);
    const windowStart = addDays(today, -days);
    const rows = await db
      .select({
        id: transactions.id,
        date: transactions.date,
        amount: transactions.baseAmount,
        currency: transactions.baseCurrency,
        merchant: transactions.merchant,
        description: transactions.description,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        reference: transactions.reference,
        externalId: transactions.externalId,
        source: transactions.source,
        accountId: transactions.accountId,
      })
      .from(transactions)
      .leftJoin(categories, eq(categories.id, transactions.categoryId))
      .where(
        and(
          eq(transactions.workspaceId, ctx.workspaceId),
          eq(transactions.status, "posted"),
          eq(transactions.type, "expense"),
          gte(transactions.date, windowStart),
          lte(transactions.date, today),
          sql`${transactions.baseAmount} > 0`,
        ),
      )
      .orderBy(asc(transactions.date))
      .limit(4000);

    const expenses = rows.map((row) => ({ ...row, amount: Number(row.amount) }));
    const byCategory = new Map<string, number[]>();
    for (const expense of expenses) {
      const key = expense.categoryId ?? "uncategorized";
      const list = byCategory.get(key) ?? [];
      list.push(expense.amount);
      byCategory.set(key, list);
    }
    const categoryMedian = new Map([...byCategory.entries()].map(([key, values]) => [key, median(values)]));
    const overallMedian = median(expenses.map((expense) => expense.amount)) || 1;

    const flagged =
      expenses.length > 6
        ? isolationForest(
            standardize(
              expenses.map((expense) => {
                const baseline = categoryMedian.get(expense.categoryId ?? "uncategorized") ?? overallMedian;
                return [Math.log1p(expense.amount), Math.log1p(expense.amount / Math.max(1, baseline))];
              }),
            ).points,
            { trees: 120, sampleSize: Math.min(128, expenses.length), threshold: 0.6, seed: 42 },
          )
        : { anomalies: [] as number[], scores: [] as number[] };

    const largeTransactions = flagged.anomalies.slice(0, 12).flatMap((index) => {
      const expense = expenses[index];
      const score = flagged.scores[index];
      if (!expense) return [];
      const baseline = categoryMedian.get(expense.categoryId ?? "uncategorized") ?? overallMedian;
      const ratio = baseline > 0 ? expense.amount / baseline : 1;
      const categoryLabel = expense.categoryName ?? "expense";
      return [
        {
          id: expense.id,
          date: expense.date,
          amount: expense.amount,
          currency: expense.currency ?? ctx.baseCurrency,
          merchant: expense.merchant ?? expense.description ?? "Unknown",
          categoryName: expense.categoryName,
          score: Math.round((score ?? 0) * 1000) / 1000,
          ratio: Math.round(ratio * 10) / 10,
          reason:
            ratio >= 2
              ? `${ratio.toFixed(1)}× your usual ${categoryLabel}`
              : `Unusually large for ${categoryLabel}`,
          href: `/transactions?from=${expense.date}&to=${expense.date}`,
        },
      ];
    });

    // Category totals well above their own recent pattern.
    const categoryData = await this.categoryMonthly(ctx, 6);
    const completedMonths = this.completed(categoryData.months);
    const currentMonth = completedMonths.at(-1) ?? "";
    const historyMonths = completedMonths.slice(0, -1);
    const monthlyExpenseAverage = mean(categoryData.items.map((item) => Math.round(item.total / Math.max(1, categoryData.months.length))));
    const points: SeriesPoint[] = categoryData.items
      .map((item) => ({
        key: item.categoryId,
        label: item.name,
        history: historyMonths.map((month) => item.monthly.find((point) => point.month === month)?.value ?? 0),
        current: item.monthly.find((point) => point.month === currentMonth)?.value ?? 0,
        transactionIds: [],
      }))
      .filter((point) => point.current > 0);
    const spikes = detectSpikes(points, {
      minAbsolute: Math.max(1000, Math.round(monthlyExpenseAverage * 0.02)),
      format: (value) => formatMoney(value, ctx.baseCurrency),
      period: currentMonth,
    }).slice(0, 6);

    // The same money entered twice: equal amount, currency and merchant
    // within a week, scored by the ledger's duplicate matcher.
    const byAmount = new Map<string, typeof expenses>();
    for (const expense of expenses) {
      const key = `${expense.currency ?? ""}:${expense.amount}`;
      const list = byAmount.get(key) ?? [];
      if (list.length < 8) list.push(expense);
      byAmount.set(key, list);
    }
    const duplicates: Array<{
      a: { id: string; date: string; amount: number; merchant: string | null };
      b: { id: string; date: string; amount: number; merchant: string | null };
      score: number;
      reasons: string[];
      currency: string;
    }> = [];
    for (const group of byAmount.values()) {
      if (group.length < 2) continue;
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const a = group[i];
          const b = group[j];
          if (!a || !b) continue;
          if (Math.abs(diffDays(a.date, b.date)) > 7) continue;
          const match = scoreDuplicate(
            {
              date: a.date,
              amount: a.amount,
              currency: a.currency ?? "",
              merchant: a.merchant,
              accountId: a.accountId,
              reference: a.reference,
              externalKey: a.externalId ? `${a.source}:${a.externalId}` : null,
            },
            {
              date: b.date,
              amount: b.amount,
              currency: b.currency ?? "",
              merchant: b.merchant,
              accountId: b.accountId,
              reference: b.reference,
              externalKey: b.externalId ? `${b.source}:${b.externalId}` : null,
            },
          );
          if (match.score < 0.65) continue;
          duplicates.push({
            a: { id: a.id, date: a.date, amount: a.amount, merchant: a.merchant },
            b: { id: b.id, date: b.date, amount: b.amount, merchant: b.merchant },
            score: Math.round(match.score * 100) / 100,
            reasons: match.reasons,
            currency: a.currency ?? ctx.baseCurrency,
          });
        }
      }
    }
    duplicates.sort((a, b) => b.score - a.score);

    return {
      currency: ctx.baseCurrency,
      asOf: today,
      windowDays: days,
      scanned: expenses.length,
      transactions: largeTransactions,
      spikes,
      duplicates: duplicates.slice(0, 10),
      counts: { transactions: largeTransactions.length, spikes: spikes.length, duplicates: duplicates.length },
    };
  }

  // ------------------------------------------------------------ subscriptions

  async subscriptionDuplicates(ctx: WorkspaceContext) {
    const list = await this.subscriptions.list(ctx);
    const byId = new Map(list.items.map((item) => [item.id, item]));
    const duplicates = findDuplicateSubscriptions(
      list.items.map((item) => ({
        id: item.id,
        name: item.name,
        provider: item.provider,
        amount: item.amount,
        currency: item.currency,
        frequency: item.billingCycle as Frequency,
        intervalCount: item.intervalCount,
        intervalUnit: (item.intervalUnit ?? null) as IntervalUnit | null,
        status: item.commitmentStatus === "active" ? "active" : item.derivedStatus,
      })),
    ).map((duplicate) => {
      const a = byId.get(duplicate.aId);
      const b = byId.get(duplicate.bId);
      const aMonthlyBase = a?.monthlyEquivalentBase ?? null;
      const bMonthlyBase = b?.monthlyEquivalentBase ?? null;
      return {
        ...duplicate,
        aHref: `/subscriptions/${duplicate.aId}`,
        bHref: `/subscriptions/${duplicate.bId}`,
        aMonthlyBase,
        bMonthlyBase,
        savingsBase: aMonthlyBase !== null && bMonthlyBase !== null ? Math.min(aMonthlyBase, bMonthlyBase) : null,
      };
    });
    return {
      baseCurrency: ctx.baseCurrency,
      duplicates,
      potentialMonthly: duplicates.reduce((total, duplicate) => total + (duplicate.savingsBase ?? 0), 0),
      activeCount: list.items.filter((item) => item.commitmentStatus === "active").length,
    };
  }
}
