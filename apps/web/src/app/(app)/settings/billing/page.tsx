import { BillingView } from "@/features/billing/billing-view";
import { SettingsPage } from "@/features/settings/settings-page";
import { api } from "@/shared/api/server";
import type { BillingOverview } from "@/shared/api/types/billing";

export const metadata = { title: "Plan & billing" };

export default async function Page({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
  const overview = await api<BillingOverview>("/billing");
  return (
    <SettingsPage title="Plan & billing" description="Your plan, what it includes, AI credits and payments.">
      <BillingView overview={overview} checkout={checkout} />
    </SettingsPage>
  );
}
