import { PageShell } from "@/features/app/page-shell";
import { SpendingForecastPanel } from "@/features/insights/spending-forecast-panel";
import type { ExpenseForecast } from "@/features/insights/types";
import { ForecastView } from "@/features/reports/forecast-view";
import type { Forecast } from "@/features/reports/types";
import { api } from "@/shared/api/server";

export const metadata = { title: "Forecasts" };

export default async function ForecastsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days } = await searchParams;
  const horizon = [30, 60, 90].includes(Number(days)) ? Number(days) : 90;
  const [forecast, spending] = await Promise.all([
    api<Forecast>("/analytics/forecast", { query: { days: horizon } }),
    api<ExpenseForecast>("/analytics/expense-forecast", { query: { months: 6 } }),
  ]);
  return (
    <PageShell title="Forecasts" width="wide">
      <ForecastView forecast={forecast} />
      <div className="mt-4 border-t border-border/60 pt-4">
        <h2 className="mb-3 text-base font-semibold">Spending forecast</h2>
        <SpendingForecastPanel data={spending} />
      </div>
    </PageShell>
  );
}
