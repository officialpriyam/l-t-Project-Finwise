import { presetRange, today } from "@finwise/core";
import type { Metadata } from "next";
import { PageShell } from "@/features/app/page-shell";
import { OverviewView } from "@/features/overview/overview-view";
import type { HealthAssessment } from "@/features/insights/types";
import type { OverviewData } from "@/features/overview/types";
import { api, apiOrNull } from "@/shared/api/server";
import type { Account, CurrentWorkspace, Me, TransactionPage } from "@/shared/api/types";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const [me, workspace] = await Promise.all([api<Me>("/me"), api<CurrentWorkspace>("/workspaces/current")]);
  const day = today(workspace.timezone);
  const month = presetRange("this_month", day);
  const [overview, accounts, recent, monthTotals, health] = await Promise.all([
    apiOrNull<OverviewData>("/analytics/overview"),
    api<Account[]>("/accounts"),
    api<TransactionPage>("/transactions", { query: { pageSize: 8 } }),
    api<TransactionPage>("/transactions", { query: { from: month.from, to: month.to, pageSize: 1 } }),
    api<HealthAssessment>("/analytics/health").catch(() => null),
  ]);
  return (
    <PageShell title="Overview" width="wide">
      <OverviewView me={me} workspace={workspace} overview={overview} accounts={accounts} recent={recent} monthTotals={monthTotals.totals} health={health} today={day} />
    </PageShell>
  );
}
