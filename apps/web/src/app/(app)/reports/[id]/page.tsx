import { notFound } from "next/navigation";
import { PageShell } from "@/features/app/page-shell";
import { ReportDetail } from "@/features/reports/report-detail";
import type { Report } from "@/features/reports/types";
import { apiOrNull } from "@/shared/api/server";

export const metadata = { title: "Report" };

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await apiOrNull<Report>(`/reports/${id}`);
  if (!report) notFound();
  return (
    <PageShell title={report.title} crumbs={[{ label: "Reports", href: "/reports?tab=saved" }]} backHref="/reports?tab=saved">
      <ReportDetail report={report} />
    </PageShell>
  );
}
