import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/features/app/page-shell";
import { ReceivableDetailView } from "@/features/wealth/receivables";
import { apiOrNull } from "@/shared/api/server";
import type { ReceivableDetail } from "@/shared/api/types/wealth";

export const metadata: Metadata = { title: "Receivable" };

export default async function ReceivablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receivable = await apiOrNull<ReceivableDetail>(`/receivables/${id}`);
  if (!receivable) notFound();
  return (
    <PageShell
      title={receivable.title}
      crumbs={[
        { label: "Wealth", href: "/wealth/net-worth" },
        { label: "Receivables", href: "/wealth/receivables" },
      ]}
      backHref="/wealth/receivables"
      width="wide"
    >
      <ReceivableDetailView receivable={receivable} />
    </PageShell>
  );
}
