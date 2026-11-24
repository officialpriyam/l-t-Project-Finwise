import type { Metadata } from "next";
import { PageShell } from "@/features/app/page-shell";
import { NetWorthView } from "@/features/wealth/net-worth";
import { api } from "@/shared/api/server";
import type { NetWorthCurrent, NetWorthHistory } from "@/shared/api/types/wealth";

export const metadata: Metadata = { title: "Net worth" };

export default async function NetWorthPage() {
  const [current, history] = await Promise.all([api<NetWorthCurrent>("/net-worth"), api<NetWorthHistory>("/net-worth/history", { query: { months: 12 } })]);
  return (
    <PageShell title="Net worth" crumbs={[{ label: "Wealth" }]} width="wide">
      <NetWorthView current={current} history={history} />
    </PageShell>
  );
}
