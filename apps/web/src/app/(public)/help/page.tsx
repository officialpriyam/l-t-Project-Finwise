import type { Metadata } from "next";
import Link from "next/link";
import { SiteSection } from "@/features/marketing/site-chrome";
import { HelpCenter } from "@/features/support/help-center";

export const metadata: Metadata = {
  title: "How to use FinWise",
  description: "A practical guide to capturing money, reading the ledger, using the copilot, running business books, inviting people and exporting your data.",
};

export default function HelpPage() {
  return (
    <>
      <SiteSection className="py-14">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Help centre</p>
        <h1 className="mt-2 max-w-2xl font-semibold text-3xl tracking-tight md:text-4xl">How to use FinWise</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Everything from your first transaction to payroll, exports and the API. Signed in? The same answers live in the support agent at the bottom-right of every
          screen, next to a shortcut to the copilot.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Prefer to ask a person?{" "}
          <Link href="/contact" className="underline underline-offset-4 hover:text-foreground">
            Write to the team
          </Link>
          .
        </p>
      </SiteSection>
      <SiteSection className="pb-20">
        <HelpCenter />
      </SiteSection>
    </>
  );
}
