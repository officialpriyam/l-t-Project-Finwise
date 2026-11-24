import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/features/app/page-shell";
import { AssetDetailView } from "@/features/wealth/assets";
import { apiOrNull } from "@/shared/api/server";
import type { AssetDetail } from "@/shared/api/types/wealth";

export const metadata: Metadata = { title: "Asset" };

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await apiOrNull<AssetDetail>(`/assets/${id}`);
  if (!asset) notFound();
  return (
    <PageShell
      title={asset.name}
      crumbs={[
        { label: "Wealth", href: "/wealth/net-worth" },
        { label: "Assets", href: "/wealth/assets" },
      ]}
      backHref="/wealth/assets"
      width="wide"
    >
      <AssetDetailView asset={asset} />
    </PageShell>
  );
}
