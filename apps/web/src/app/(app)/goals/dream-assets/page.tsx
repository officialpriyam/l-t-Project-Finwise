import type { Metadata } from "next";
import { PageShell } from "@/features/app/page-shell";
import { AddGoalButton, GoalsView } from "@/features/planning/goals-view";
import { api } from "@/shared/api/server";
import type { GoalList } from "@/shared/api/types/planning";

export const metadata: Metadata = { title: "Dream assets" };

export default async function DreamAssetsPage() {
  const list = await api<GoalList>("/goals", { query: { kind: "dream_asset" } });
  return (
    <PageShell
      title="Dream assets"
      crumbs={[{ label: "Goals", href: "/goals" }]}
      actions={<AddGoalButton kind="dream_asset" label="Add dream asset" />}
      width="wide"
    >
      <GoalsView list={list} variant="dream" />
    </PageShell>
  );
}
