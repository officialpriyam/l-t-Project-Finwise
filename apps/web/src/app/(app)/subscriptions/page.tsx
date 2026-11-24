import { today } from "@finwise/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageShell } from "@/features/app/page-shell";
import { AddSubscriptionButton, SubscriptionsView } from "@/features/planning/subscriptions-view";
import { api } from "@/shared/api/server";
import { fromSearchParams } from "@/shared/api/shared";
import type { CurrentWorkspace } from "@/shared/api/types";
import type { SubscriptionAnalytics, SubscriptionList } from "@/shared/api/types/planning";
import type { SubscriptionDuplicates } from "@/features/insights/types";

export const metadata: Metadata = { title: "Subscriptions" };

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = fromSearchParams(await searchParams);
  // Notifications and other pages link here with a subscription or commitment id.
  if (params.focus) {
    const all = await api<SubscriptionList>("/subscriptions");
    const match = all.items.find((s) => s.id === params.focus || s.commitmentId === params.focus);
    if (match) redirect(`/subscriptions/${match.id}`);
  }
  const filters = { q: params.q, status: params.status, billingCycle: params.billingCycle, sort: params.sort };
  const [list, analytics, workspace, duplicates] = await Promise.all([
    api<SubscriptionList>("/subscriptions", { query: filters }),
    api<SubscriptionAnalytics>("/subscriptions/analytics"),
    api<CurrentWorkspace>("/workspaces/current"),
    api<SubscriptionDuplicates>("/analytics/subscription-duplicates").catch(() => null),
  ]);
  return (
    <PageShell title="Subscriptions" actions={<AddSubscriptionButton />} width="wide">
      <SubscriptionsView list={list} analytics={analytics} filters={filters} duplicates={duplicates} today={today(workspace.timezone)} />
    </PageShell>
  );
}
