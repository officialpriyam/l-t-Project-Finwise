"use client";

import { CalendarRange, ChartSpline, Info, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/features/app/app-context";
import { CategoryTile, EmptyNote, Section, StatCard } from "@/features/app/blocks";
import { ForecastChart } from "@/features/charts/charts";
import { cn } from "@/shared/cn";
import { formatMonth } from "@/shared/format-client";
import type { ExpenseForecast } from "./types";

/**
 * The projected spending run-rate: history, next months with an 80% band, and
 * the categories expected to lead. Says "estimate" wherever a number is a guess.
 */
export function SpendingForecastPanel({ data }: { data: ExpenseForecast }) {
  const { money } = useApp();
  const { forecast } = data;
  if (!forecast.points.length) {
    return (
      <Section title="Spending forecast" hint="Next few months">
        <EmptyNote>Record a few months of spending and the forecast appears here.</EmptyNote>
      </Section>
    );
  }
  const next = forecast.points[0];
  const lastHistory = data.history.at(-1);
  const combined = [
    ...data.history.map((point) => ({ label: point.month, balance: point.value, low: null as number | null, high: null as number | null })),
    ...forecast.points.map((point) => ({ label: point.month, balance: point.forecast, low: point.low, high: point.high })),
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Wallet} label="Usual month" value={money(data.averageMonthly)} hint="Average of completed months" />
        <StatCard
          icon={ChartSpline}
          label="Next month (estimate)"
          value={money(next?.forecast ?? 0)}
          hint={
            lastHistory && next ? (
              <span className={cn(next.forecast > lastHistory.value ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                {next.forecast >= lastHistory.value ? "up" : "down"} from {money(lastHistory.value)}
              </span>
            ) : undefined
          }
        />
        <StatCard
          icon={CalendarRange}
          label={`Next ${forecast.points.length} months (estimate)`}
          value={money(forecast.total)}
          hint={`${money(Math.round(forecast.total / forecast.points.length))} a month`}
        />
        <StatCard
          icon={Sparkles}
          label="Confidence"
          value={`${forecast.confidence}%`}
          hint={forecast.backtest?.accuracy !== null && forecast.backtest ? `Backtest: ${forecast.backtest.accuracy}% accurate` : forecast.method.replace("+", " + ")}
        />
      </div>

      <Section
        title="Spending, projected"
        hint={`History plus the next ${forecast.points.length} months · ${forecast.method.replace("+", " + ")}`}
      >
        <ForecastChart
          data={combined}
          format={(value) => money(value)}
          axisFormat={(value) => money(value, undefined, { compact: true })}
          tickFormat={(label) => formatMonth(label, "en-GB", true).split(" ")[0] ?? label}
          labelFormat={(label) => formatMonth(label)}
          labels={{ main: "Actual and projected spending (estimate)", band: "80% likely range" }}
          height={240}
        />
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Info className="size-3 shrink-0" /> Trend this month: {money(forecast.trendPerMonth, undefined, { signed: true })}
          </li>
          {forecast.assumptions.slice(0, 2).map((line) => (
            <li key={line} className="flex items-center gap-1.5">
              <Info className="size-3 shrink-0" /> {line}
            </li>
          ))}
        </ul>
      </Section>

      {data.byCategory.length > 0 && (
        <Section title="Where the forecast comes from" hint="Largest categories, next month against their recent average">
          <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {data.byCategory.slice(0, 6).map((category) => {
              const nextPoint = category.forecast.points[0];
              const recent = Math.round(category.recentTotal / Math.max(1, category.history.length));
              return (
                <li key={category.categoryId} className="flex items-center gap-3">
                  <CategoryTile icon={category.icon} color={category.color} size="sm" />
                  <span className="min-w-0 flex-1">
                    <Link href={`/transactions?categoryId=${category.categoryId}`} className="block truncate text-sm hover:underline">
                      {category.name}
                    </Link>
                    <span className="text-xs text-muted-foreground tabular-nums">recently {money(recent)}/mo</span>
                  </span>
                  <span className="shrink-0 text-right text-sm tabular-nums">
                    {money(nextPoint?.forecast ?? 0)}
                    {nextPoint && (
                      <span
                        className={cn(
                          "block text-[11px]",
                          nextPoint.forecast > recent ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        {nextPoint.forecast >= recent ? "+" : ""}
                        {recent > 0 ? Math.round(((nextPoint.forecast - recent) / recent) * 100) : 0}%
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="text-[11px] text-muted-foreground">{data.note}</p>
        </Section>
      )}
    </div>
  );
}
