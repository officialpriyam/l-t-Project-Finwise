import type { Metadata } from "next";
import { PageShell } from "@/features/app/page-shell";
import { ImportWizard, RecentImports } from "@/features/integrations/import-wizard";
import { api } from "@/shared/api/server";
import type { Account, Category, CurrentWorkspace, Project } from "@/shared/api/types";
import type { ImportBatch, Page } from "@/shared/api/types/integrations";

export const metadata: Metadata = { title: "Import statement" };

export default async function ImportPage() {
  const workspace = await api<CurrentWorkspace>("/workspaces/current");
  const [recent, accounts, categories, projects] = await Promise.all([
    api<Page<ImportBatch>>("/imports", { query: { pageSize: 15 } }),
    api<Account[]>("/accounts"),
    api<Category[]>("/categories"),
    workspace.kind === "business" ? api<Project[]>("/projects") : Promise.resolve([] as Project[]),
  ]);
  return (
    <PageShell frame="settings" title="Import statement" crumbs={[{ label: "Integrations", href: "/integrations" }]} width="wide">
      <ImportWizard initial={null} accounts={accounts} categories={categories} projects={projects} />
      <RecentImports batches={recent.items} />
    </PageShell>
  );
}
