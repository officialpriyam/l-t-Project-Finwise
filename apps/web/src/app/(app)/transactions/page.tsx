import type { Metadata } from "next";
import { PageShell } from "@/features/app/page-shell";
import { loadTransactions } from "@/features/transactions/load";
import { TransactionsView } from "@/features/transactions/transactions-view";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const data = await loadTransactions(searchParams);
  return (
    <PageShell title="Transactions" width="wide">
      <TransactionsView {...data} />
    </PageShell>
  );
}
