import type { Metadata } from "next";
import { PageShell } from "@/features/app/page-shell";
import { presetFrom } from "@/features/business/presets";
import { NewProjectButton, ProjectsView } from "@/features/business/projects";
import { api } from "@/shared/api/server";
import type { ProjectOverview } from "@/shared/api/types/business";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ preset?: string }> }) {
  const { preset: raw } = await searchParams;
  const preset = presetFrom(raw, "all_time");
  const overview = await api<ProjectOverview>("/projects/finance", {
    query: { preset },
  });
  return (
    <PageShell title="Projects" crumbs={[{ label: "Business" }]} actions={<NewProjectButton />} width="wide">
      <ProjectsView overview={overview} preset={preset} />
    </PageShell>
  );
}
