import { CurrencySettings } from "@/features/settings/misc-settings";
import { SettingsPage } from "@/features/settings/settings-page";
import { api } from "@/shared/api/server";
import type { ExchangeRate } from "@/shared/api/types";

export const metadata = { title: "Currency" };

export default async function Page() {
  const rates = await api<ExchangeRate[]>("/exchange-rates");
  return (
    <SettingsPage title="Currency" description="Exchange rates used to convert foreign amounts into your reporting currency.">
      <CurrencySettings rates={rates} />
    </SettingsPage>
  );
}
