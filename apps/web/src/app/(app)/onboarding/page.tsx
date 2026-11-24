import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { LOCALE_COOKIES } from "@/features/marketing/locale-cookies";
import { api } from "@/shared/api/server";
import type { CurrentWorkspace, Me } from "@/shared/api/types";

export const metadata = { title: "Set up your books" };

function isTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export default async function Page() {
  const [me, current, jar] = await Promise.all([api<Me>("/me"), api<CurrentWorkspace>("/workspaces/current"), cookies()]);
  // Setup is only for new accounts that have not finished it.
  if ((me.preferences as { onboarded?: boolean }).onboarded !== false) redirect("/");
  const personal = me.workspaces.find((w) => w.kind === "personal" && w.role === "owner");
  const business = me.workspaces.find((w) => w.kind === "business" && w.role === "owner");
  // The landing page's country/currency picker leaves its choice in cookies.
  const pickedCurrency = jar.get(LOCALE_COOKIES.currency)?.value.toUpperCase() ?? "";
  const pickedTimezone = jar.get(LOCALE_COOKIES.timezone)?.value ?? "";
  const defaultCurrency = /^[A-Z]{3}$/.test(pickedCurrency) ? pickedCurrency : (personal?.baseCurrency ?? current.baseCurrency);
  const hasPickedTimezone = isTimeZone(pickedTimezone);
  const defaultTimezone = hasPickedTimezone ? pickedTimezone : current.timezone;
  return (
    <OnboardingForm
      name={me.user.name}
      defaultCurrency={defaultCurrency}
      defaultTimezone={defaultTimezone}
      preferDefaultTimezone={hasPickedTimezone}
      businessName={business?.name ?? null}
    />
  );
}
