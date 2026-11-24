import { isDay, today } from "@finwise/core";
import type { Metadata } from "next";
import { PageShell } from "@/features/app/page-shell";
import { AddBudgetButton, BudgetsView } from "@/features/planning/budgets-view";
import { api } from "@/shared/api/server";
import { fromSearchParams } from "@/shared/api/shared";
import type { CurrentWorkspace } from "@/shared/api/types";
import type { BudgetList } from "@/shared/api/types/planning";
import type { BudgetRecommendations } from "@/features/insights/types";

export const metadata: Metadata = { title: "Budgets" };

export default async function BudgetsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = fromSearchParams(await searchParams);
  const workspace = await api<CurrentWorkspace>("/workspaces/current");
  const [list, recommendations] = await Promise.all([
    api<BudgetList>("/budgets", { query: { date: isDay(params.date) ? params.date : undefined } }),
    api<BudgetRecommendations>("/analytics/budget-recommendations").catch(() => null),
  ]);
  return (
    <PageShell title="Budgets" actions={<AddBudgetButton />} width="wide">
      <BudgetsView list={list} recommendations={recommendations} today={today(workspace.timezone)} />
    </PageShell>
  );
}
