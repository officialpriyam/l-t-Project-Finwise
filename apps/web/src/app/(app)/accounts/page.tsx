import type { Metadata } from "next";
import { AccountsView, AddAccountButton } from "@/features/accounts/accounts-view";
import { PageShell } from "@/features/app/page-shell";
import { api } from "@/shared/api/server";
import type { Account } from "@/shared/api/types";

export const metadata: Metadata = { title: "Accounts" };

export default async function AccountsPage({ searchParams }: { searchParams: Promise<{ archived?: string }> }) {
  const { archived } = await searchParams;
  const accounts = await api<Account[]>("/accounts", { query: { includeArchived: archived === "1" } });
  return (
    <PageShell title="Accounts" actions={<AddAccountButton />}>
      <AccountsView accounts={accounts} />
    </PageShell>
  );
}
