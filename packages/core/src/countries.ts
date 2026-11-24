// Countries the landing page and first-run setup offer, each with the currency
// and timezone its books usually start in. This is a starting point, not a
// restriction: the API accepts any ISO currency code and any IANA timezone.

export type Country = {
  code: string;
  name: string;
  currency: string;
  timezone: string;
};

const BANGLADESH: Country = { code: "BD", name: "Bangladesh", currency: "BDT", timezone: "Asia/Dhaka" };

/** Bangladesh first (the home market), then the rest alphabetically. */
export const COUNTRIES: readonly Country[] = [
  BANGLADESH,
  { code: "AE", name: "United Arab Emirates", currency: "AED", timezone: "Asia/Dubai" },
  { code: "AF", name: "Afghanistan", currency: "AFN", timezone: "Asia/Kabul" },
  { code: "AR", name: "Argentina", currency: "ARS", timezone: "America/Argentina/Buenos_Aires" },
  { code: "AU", name: "Australia", currency: "AUD", timezone: "Australia/Sydney" },
  { code: "BH", name: "Bahrain", currency: "BHD", timezone: "Asia/Bahrain" },
  { code: "BE", name: "Belgium", currency: "EUR", timezone: "Europe/Brussels" },
  { code: "BT", name: "Bhutan", currency: "BTN", timezone: "Asia/Thimphu" },
  { code: "BR", name: "Brazil", currency: "BRL", timezone: "America/Sao_Paulo" },
  { code: "CA", name: "Canada", currency: "CAD", timezone: "America/Toronto" },
  { code: "CL", name: "Chile", currency: "CLP", timezone: "America/Santiago" },
  { code: "CN", name: "China", currency: "CNY", timezone: "Asia/Shanghai" },
  { code: "CO", name: "Colombia", currency: "COP", timezone: "America/Bogota" },
  { code: "DK", name: "Denmark", currency: "DKK", timezone: "Europe/Copenhagen" },
  { code: "EG", name: "Egypt", currency: "EGP", timezone: "Africa/Cairo" },
  { code: "FR", name: "France", currency: "EUR", timezone: "Europe/Paris" },
  { code: "DE", name: "Germany", currency: "EUR", timezone: "Europe/Berlin" },
  { code: "GH", name: "Ghana", currency: "GHS", timezone: "Africa/Accra" },
  { code: "HK", name: "Hong Kong", currency: "HKD", timezone: "Asia/Hong_Kong" },
  { code: "IN", name: "India", currency: "INR", timezone: "Asia/Kolkata" },
  { code: "ID", name: "Indonesia", currency: "IDR", timezone: "Asia/Jakarta" },
  { code: "IE", name: "Ireland", currency: "EUR", timezone: "Europe/Dublin" },
  { code: "IT", name: "Italy", currency: "EUR", timezone: "Europe/Rome" },
  { code: "JP", name: "Japan", currency: "JPY", timezone: "Asia/Tokyo" },
  { code: "KE", name: "Kenya", currency: "KES", timezone: "Africa/Nairobi" },
  { code: "KW", name: "Kuwait", currency: "KWD", timezone: "Asia/Kuwait" },
  { code: "MY", name: "Malaysia", currency: "MYR", timezone: "Asia/Kuala_Lumpur" },
  { code: "MV", name: "Maldives", currency: "MVR", timezone: "Indian/Maldives" },
  { code: "MX", name: "Mexico", currency: "MXN", timezone: "America/Mexico_City" },
  { code: "MA", name: "Morocco", currency: "MAD", timezone: "Africa/Casablanca" },
  { code: "NP", name: "Nepal", currency: "NPR", timezone: "Asia/Kathmandu" },
  { code: "NL", name: "Netherlands", currency: "EUR", timezone: "Europe/Amsterdam" },
  { code: "NZ", name: "New Zealand", currency: "NZD", timezone: "Pacific/Auckland" },
  { code: "NG", name: "Nigeria", currency: "NGN", timezone: "Africa/Lagos" },
  { code: "NO", name: "Norway", currency: "NOK", timezone: "Europe/Oslo" },
  { code: "OM", name: "Oman", currency: "OMR", timezone: "Asia/Muscat" },
  { code: "PK", name: "Pakistan", currency: "PKR", timezone: "Asia/Karachi" },
  { code: "PE", name: "Peru", currency: "PEN", timezone: "America/Lima" },
  { code: "PH", name: "Philippines", currency: "PHP", timezone: "Asia/Manila" },
  { code: "PL", name: "Poland", currency: "PLN", timezone: "Europe/Warsaw" },
  { code: "PT", name: "Portugal", currency: "EUR", timezone: "Europe/Lisbon" },
  { code: "QA", name: "Qatar", currency: "QAR", timezone: "Asia/Qatar" },
  { code: "RU", name: "Russia", currency: "RUB", timezone: "Europe/Moscow" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", timezone: "Asia/Riyadh" },
  { code: "SG", name: "Singapore", currency: "SGD", timezone: "Asia/Singapore" },
  { code: "ZA", name: "South Africa", currency: "ZAR", timezone: "Africa/Johannesburg" },
  { code: "KR", name: "South Korea", currency: "KRW", timezone: "Asia/Seoul" },
  { code: "ES", name: "Spain", currency: "EUR", timezone: "Europe/Madrid" },
  { code: "LK", name: "Sri Lanka", currency: "LKR", timezone: "Asia/Colombo" },
  { code: "SE", name: "Sweden", currency: "SEK", timezone: "Europe/Stockholm" },
  { code: "CH", name: "Switzerland", currency: "CHF", timezone: "Europe/Zurich" },
  { code: "TW", name: "Taiwan", currency: "TWD", timezone: "Asia/Taipei" },
  { code: "TZ", name: "Tanzania", currency: "TZS", timezone: "Africa/Dar_es_Salaam" },
  { code: "TH", name: "Thailand", currency: "THB", timezone: "Asia/Bangkok" },
  { code: "TR", name: "Turkey", currency: "TRY", timezone: "Europe/Istanbul" },
  { code: "UG", name: "Uganda", currency: "UGX", timezone: "Africa/Kampala" },
  { code: "GB", name: "United Kingdom", currency: "GBP", timezone: "Europe/London" },
  { code: "US", name: "United States", currency: "USD", timezone: "America/New_York" },
  { code: "VN", name: "Vietnam", currency: "VND", timezone: "Asia/Ho_Chi_Minh" },
];

export const DEFAULT_COUNTRY: Country = BANGLADESH;

export const COUNTRY_BY_CODE: Readonly<Record<string, Country>> = Object.fromEntries(COUNTRIES.map((country) => [country.code, country]));

export function findCountry(code: string | null | undefined): Country | undefined {
  return code ? COUNTRY_BY_CODE[code.trim().toUpperCase()] : undefined;
}
