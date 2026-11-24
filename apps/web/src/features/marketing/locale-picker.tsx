"use client";

import { COMMON_CURRENCIES, COUNTRIES, DEFAULT_COUNTRY, findCountry } from "@finwise/core";
import { Check, Globe2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LOCALE_COOKIES } from "@/features/marketing/locale-cookies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

const COOKIE_AGE = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const part = document.cookie.split("; ").find((item) => item.startsWith(prefix));
  return part ? decodeURIComponent(part.slice(prefix.length)) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_AGE}; samesite=lax`;
}

function currencyName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Country and currency on the landing page. The choice is a cookie, so the
 * sign-up flow can start the new books in the right currency and timezone
 * without asking again in a form the visitor cannot see yet.
 */
export function LocalePicker() {
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY.code);
  const [currency, setCurrency] = useState(DEFAULT_COUNTRY.currency);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = findCountry(readCookie(LOCALE_COOKIES.country));
    const storedCurrency = readCookie(LOCALE_COOKIES.currency)?.toUpperCase();
    if (stored) setCountryCode(stored.code);
    if (storedCurrency) setCurrency(storedCurrency);
    if (stored || storedCurrency) setSaved(true);
  }, []);

  const country = findCountry(countryCode) ?? DEFAULT_COUNTRY;
  const currencies = useMemo(() => [...new Set([currency, ...COMMON_CURRENCIES])], [currency]);

  const chooseCountry = (code: string) => {
    const next = findCountry(code);
    if (!next) return;
    setCountryCode(next.code);
    setCurrency(next.currency);
    writeCookie(LOCALE_COOKIES.country, next.code);
    writeCookie(LOCALE_COOKIES.currency, next.currency);
    writeCookie(LOCALE_COOKIES.timezone, next.timezone);
    setSaved(true);
  };

  const chooseCurrency = (code: string) => {
    setCurrency(code);
    writeCookie(LOCALE_COOKIES.currency, code);
    setSaved(true);
  };

  return (
    <div className="glass w-full max-w-xl rounded-xl border p-4">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
          <Globe2 className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-medium">Set up your books</p>
          <p className="text-xs text-muted-foreground">Pick your country and the money you think in. Your account starts with both, and you can change them later.</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Select value={country.code} onValueChange={(value) => typeof value === "string" && chooseCountry(value)}>
          <SelectTrigger aria-label="Country">
            <SelectValue>{country.name}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={currency} onValueChange={(value) => typeof value === "string" && chooseCurrency(value)}>
          <SelectTrigger aria-label="Currency">
            <SelectValue>
              {currency} · {currencyName(currency)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {currencies.map((code) => (
              <SelectItem key={code} value={code}>
                {code} · {currencyName(code)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p aria-live="polite" className="mt-2.5 text-xs text-muted-foreground">
        {saved ? (
          <span className="inline-flex items-center gap-1.5">
            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Saved. Your new books start in {currency} on {country.name} time.
          </span>
        ) : (
          <>A country sets its usual currency; pick another if you prefer.</>
        )}
      </p>
    </div>
  );
}
