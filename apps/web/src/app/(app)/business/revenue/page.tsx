import type { Metadata } from "next";
import { PageShell } from "@/features/app/page-shell";
import { presetFrom } from "@/features/business/presets";
import { RevenueView } from "@/features/business/revenue";
import { api } from "@/shared/api/server";
import type { RevenueAnalytics } from "@/shared/api/types/business";

export const metadata: Metadata = { title: "Revenue" };

export default async function RevenuePage({ searchParams }: { searchParams: Promise<{ preset?: string }> }) {
  const { preset: raw } = await searchParams;
  const preset = presetFrom(raw, "last_12_months");
  const data = await api<RevenueAnalytics>("/revenue", { query: { preset } });
  return (
    <PageShell title="Revenue" crumbs={[{ label: "Business" }]} width="wide">
      <RevenueView data={data} preset={preset} />
    </PageShell>
  );
}
