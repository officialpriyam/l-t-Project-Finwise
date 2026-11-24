import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/features/marketing/site-chrome";

/** The public site: landing, pricing, legal pages and contact. No sign-in needed. */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
