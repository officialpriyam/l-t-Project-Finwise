import {
  addDays,
  type Day,
  endOfMonth,
  endOfQuarter,
  formatDay,
  formatMoney,
  minorToInput,
  previousRange,
  type Range,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
} from "@finwise/core";
import { Inject, Injectable } from "@nestjs/common";
import { and, count, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { todayFor, type WorkspaceContext } from "../../kernel/context.js";
import { assertFound, unprocessable } from "../../kernel/errors.js";
import { db } from "../../platform/data/index.js";
import { commitments, inboxItems, reports } from "../../platform/data/schema/index.js";
import { AuditService } from "../ops/audit.service.js";
import { AnalyticsService } from "./analytics.service.js";
import { OverviewService } from "./overview.service.js";

export type ReportKind = "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

/** Writes the prose around a report's numbers; may only restate `data`. */
export type NarrativeWriter = (ctx: WorkspaceContext, data: ReportData) => Promise<{ text: string; provider: string; model: string } | null>;

export type ReportData = Awaited<ReturnType<ReportsService["build"]>>;

@Injectable()
export class ReportsService {
  private writer: NarrativeWriter | null = null;

  constructor(
    @Inject(AnalyticsService) private readonly analytics: AnalyticsService,
    @Inject(OverviewService) private readonly overview: OverviewService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  /** The AI module registers a writer; without one, the template is used. */
  setNarrativeWriter(writer: NarrativeWriter) {
    this.writer = writer;
  }

  rangeFor(ctx: WorkspaceContext, kind: ReportKind, from?: Day, to?: Day): Range {
    const today = todayFor(ctx);
    if (kind === "custom") {
      if (!from || !to || from > to) throw unprocessable("A custom report needs a start and an end date");
      return { from, to };
    }
    // The last complete period: a report describes what has happened.
    if (kind === "weekly") {
      const thisWeek = startOfWeek(today, 6);
      return { from: addDays(thisWeek, -7), to: addDays(thisWeek, -1) };
    }
    if (kind === "monthly") {
      const previous = addDays(startOfMonth(today), -1);
      return { from: startOfMonth(previous), to: endOfMonth(previous) };
    }
    if (kind === "yearly") {
      const year = Number(today.slice(0, 4)) - 1;
      return { from: `${year}-01-01`, to: `${year}-12-31` };
    }
    const previous = addDays(startOfQuarter(today), -1);
    return { from: startOfQuarter(previous), to: endOfQuarter(previous) };
  }

  /** The structured snapshot. Every number in a report comes from here. */
  async build(ctx: WorkspaceContext, range: Range) {
    const previous = previousRange(range);
    const [current, before, categories, incomeCategories, merchants, cashFlow, overview, anomalies, recurring] = await Promise.all([
      this.analytics.summary(ctx, range),
      this.analytics.summary(ctx, previous),
      this.analytics.byCategory(ctx, range, "expense"),
      this.analytics.byCategory(ctx, range, "income"),
      this.analytics.topMerchants(ctx, range, "expense", 8),
      this.analytics.cashFlow(ctx, range),
      this.overview.overview(ctx),
      db
        .select()
        .from(inboxItems)
        .where(
          and(
            eq(inboxItems.workspaceId, ctx.workspaceId),
            inArray(inboxItems.kind, ["anomaly", "price_change", "large_transaction"]),
            gte(inboxItems.createdAt, new Date(`${range.from}T00:00:00Z`)),
            lte(inboxItems.createdAt, new Date(`${addDays(range.to, 1)}T00:00:00Z`)),
          ),
        )
        .orderBy(desc(inboxItems.createdAt))
        .limit(10),
      db
        .select({
          value: count(),
          monthly: sql<string>`coalesce(sum(case frequency when 'monthly' then amount when 'yearly' then amount / 12 when 'quarterly' then amount / 3 when 'half_yearly' then amount / 6 when 'weekly' then amount * 52 / 12 else 0 end), 0)`,
        })
        .from(commitments)
        .where(
          and(
            eq(commitments.workspaceId, ctx.workspaceId),
            eq(commitments.status, "active"),
            eq(commitments.direction, "out"),
            eq(commitments.currency, ctx.baseCurrency),
          ),
        ),
    ]);
    const changes = categories
      .slice(0, 8)
      .map((category) => ({ ...category }))
      .filter(Boolean);
    const previousCategories = await this.analytics.byCategory(ctx, previous, "expense");
    const categoryChanges = changes.map((category) => {
      const prior = previousCategories.find((p) => p.categoryId === category.categoryId)?.amount ?? 0;
      return { name: category.name, current: category.amount, previous: prior, change: category.amount - prior, href: category.href };
    });

    return {
      range,
      previousRange: previous,
      baseCurrency: ctx.baseCurrency,
      workspaceKind: ctx.workspaceKind,
      income: current.income,
      expenses: current.expenses,
      net: current.net,
      rate: current.rate,
      previous: { income: before.income, expenses: before.expenses, net: before.net },
      categories: categories.slice(0, 10),
      incomeCategories: incomeCategories.slice(0, 6),
      categoryChanges: categoryChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5),
      topMerchants: merchants,
      cashFlow: cashFlow.statement,
      netWorth: overview.netWorth,
      receivables: overview.receivables,
      payables: overview.payables,
      goals: overview.goals,
      projects: overview.business?.projects ?? [],
      recurringMonthly: Number(recurring[0]?.monthly ?? 0),
      recurringCount: recurring[0]?.value ?? 0,
      upcoming: overview.upcoming,
      anomalies: anomalies.map((a) => ({ title: a.title, body: a.body, href: (a.data.href as string | undefined) ?? null })),
      links: {
        expenses: `/transactions?from=${range.from}&to=${range.to}&type=expense,refund`,
        income: `/transactions?from=${range.from}&to=${range.to}&type=income`,
        all: `/transactions?from=${range.from}&to=${range.to}`,
      },
    };
  }

  /** Plain, deterministic prose from the snapshot — the fallback and the baseline. */
  template(data: ReportData, locale = "en-IN"): string {
    const money = (minor: number) => formatMoney(minor, data.baseCurrency, { locale });
    const pct = (current: number, previous: number) =>
      previous
        ? `${current >= previous ? "up" : "down"} ${Math.abs(Math.round(((current - previous) / previous) * 1000) / 10)}%`
        : "no earlier figure to compare";
    const lines: string[] = [];
    const isBusiness = data.workspaceKind === "business";
    lines.push(
      `${isBusiness ? "Revenue" : "Income"} was ${money(data.income)} (${pct(data.income, data.previous.income)} on the previous period) and spending was ${money(data.expenses)} (${pct(data.expenses, data.previous.expenses)}), leaving ${money(data.net)} ${data.net >= 0 ? "net" : "short"}.`,
    );
    if (data.rate !== null) lines.push(`${isBusiness ? "Net margin" : "Savings rate"}: ${data.rate}%.`);
    const top = data.categories.slice(0, 3).map((c) => `${c.name} ${money(c.amount)} (${c.share}%)`);
    if (top.length) lines.push(`Largest spending: ${top.join(", ")}.`);
    const moved = data.categoryChanges.filter((c) => c.previous > 0 && Math.abs(c.change) > 0).slice(0, 2);
    for (const change of moved)
      lines.push(`${change.name} ${change.change > 0 ? "rose" : "fell"} by ${money(Math.abs(change.change))} against the previous period.`);
    lines.push(`Cash accounts went from ${money(data.cashFlow.opening)} to ${money(data.cashFlow.closing)}.`);
    if (data.recurringCount) lines.push(`${data.recurringCount} active commitments cost about ${money(data.recurringMonthly)} a month.`);
    if (data.receivables.outstanding)
      lines.push(
        `Others owe you ${money(data.receivables.outstanding)}${data.receivables.overdue ? `, ${money(data.receivables.overdue)} of it overdue` : ""}.`,
      );
    if (data.netWorth) lines.push(`Net worth stands at ${money(data.netWorth.value)}${data.netWorth.complete ? "" : " (some items could not be valued)"}.`);
    if (data.anomalies.length)
      lines.push(
        `Flagged for attention: ${data.anomalies
          .slice(0, 3)
          .map((a) => a.title)
          .join("; ")}.`,
      );
    return lines.join(" ");
  }

  async generate(ctx: WorkspaceContext, input: { kind: ReportKind; from?: Day; to?: Day; withNarrative: boolean }) {
    const range = this.rangeFor(ctx, input.kind, input.from, input.to);
    const data = await this.build(ctx, range);
    let narrative = this.template(data);
    let narrativeSource: "ai" | "template" = "template";
    let provider: string | null = null;
    let model: string | null = null;
    if (input.withNarrative && this.writer) {
      try {
        const written = await this.writer(ctx, data);
        if (written?.text) {
          narrative = written.text;
          narrativeSource = "ai";
          provider = written.provider;
          model = written.model;
        }
      } catch {
        // The template stands in: a report never fails because a model did.
      }
    }
    const title =
      input.kind === "weekly"
        ? `Weekly brief · ${formatDay(range.from, "short")} – ${formatDay(range.to, "short")}`
        : input.kind === "monthly"
          ? `Monthly report · ${new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${range.from}T00:00:00Z`))}`
          : input.kind === "quarterly"
            ? `Quarterly review · ${formatDay(range.from, "short")} – ${formatDay(range.to, "medium")}`
            : input.kind === "yearly"
              ? `Annual report · ${range.from.slice(0, 4)}`
              : `Report · ${formatDay(range.from)} – ${formatDay(range.to)}`;
    return db.transaction(async (tx) => {
      const [row] = await tx
        .insert(reports)
        .values({
          workspaceId: ctx.workspaceId,
          kind: input.kind,
          periodStart: range.from,
          periodEnd: range.to,
          title,
          data: data as unknown as Record<string, unknown>,
          narrative,
          narrativeSource,
          provider,
          model,
          createdBy: ctx.userId,
        })
        .returning();
      await this.audit.record(tx, ctx, {
        action: "report.generated",
        entityType: "report",
        entityId: row?.id,
        after: { kind: input.kind, range, narrativeSource },
      });
      return row;
    });
  }

  /** The report as a spreadsheet: one row per figure, amounts as plain decimals. */
  async csv(ctx: WorkspaceContext, kind: ReportKind, from?: Day, to?: Day) {
    const range = this.rangeFor(ctx, kind, from, to);
    const data = await this.build(ctx, range);
    const money = (value: number) => minorToInput(value, data.baseCurrency);
    const rows: Array<Array<string | number>> = [];
    const push = (...cells: Array<string | number>) => rows.push(cells);
    push("Report", kind);
    push("Period from", range.from);
    push("Period to", range.to);
    push("Currency", data.baseCurrency);
    push();
    push("Summary", "Amount");
    push("Income", money(data.income));
    push("Expenses", money(data.expenses));
    push("Net", money(data.net));
    if (data.rate !== null) push("Savings rate percent", data.rate);
    push("Previous income", money(data.previous.income));
    push("Previous expenses", money(data.previous.expenses));
    push("Previous net", money(data.previous.net));
    push("Recurring monthly", money(data.recurringMonthly));
    push("Recurring commitments", data.recurringCount);
    push();
    push("Category", "Amount", "Share percent");
    for (const category of data.categories) push(category.name, money(category.amount), category.share);
    if (data.incomeCategories.length) {
      push();
      push("Income category", "Amount", "Share percent");
      for (const category of data.incomeCategories) push(category.name, money(category.amount), category.share);
    }
    if (data.topMerchants.length) {
      push();
      push("Merchant", "Amount", "Transactions");
      for (const merchant of data.topMerchants) push(merchant.name, money(merchant.amount), merchant.count);
    }
    if (data.categoryChanges.length) {
      push();
      push("Category change", "Current", "Previous", "Change");
      for (const change of data.categoryChanges) push(change.name, money(change.current), money(change.previous), money(change.change));
    }
    push();
    push("Cash flow", "Amount");
    push("Opening", money(data.cashFlow.opening));
    push("Closing", money(data.cashFlow.closing));
    if (data.receivables.outstanding) push("Receivables outstanding", money(data.receivables.outstanding));
    if (data.payables.outstanding) push("Payables outstanding", money(data.payables.outstanding));
    if (data.netWorth) push("Net worth", money(data.netWorth.value));
    push();
    push("Narrative");
    push(this.template(data));

    const escape = (value: string | number) => {
      const text = String(value);
      return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    return {
      filename: `${kind}-report-${range.from}-to-${range.to}.csv`,
      body: `\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\r\n")}`,
    };
  }

  list(ctx: WorkspaceContext) {
    return db
      .select({
        id: reports.id,
        kind: reports.kind,
        title: reports.title,
        periodStart: reports.periodStart,
        periodEnd: reports.periodEnd,
        narrativeSource: reports.narrativeSource,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .where(eq(reports.workspaceId, ctx.workspaceId))
      .orderBy(desc(reports.createdAt))
      .limit(100);
  }

  async get(ctx: WorkspaceContext, id: string) {
    const [row] = await db
      .select()
      .from(reports)
      .where(and(eq(reports.id, id), eq(reports.workspaceId, ctx.workspaceId)));
    return assertFound(row, "Report");
  }

  async remove(ctx: WorkspaceContext, id: string) {
    await db.transaction(async (tx) => {
      const [row] = await tx
        .delete(reports)
        .where(and(eq(reports.id, id), eq(reports.workspaceId, ctx.workspaceId)))
        .returning({ id: reports.id });
      assertFound(row, "Report");
      await this.audit.record(tx, ctx, { action: "report.deleted", entityType: "report", entityId: id });
    });
  }
}
