import type { Metadata } from "next";
import { PageShell } from "@/features/app/page-shell";
import { ConnectionsView } from "@/features/integrations/connections-view";
import { api } from "@/shared/api/server";
import type { Account, CurrentWorkspace, Project } from "@/shared/api/types";
import type { CatalogEntry, Connection } from "@/shared/api/types/integrations";

export const metadata: Metadata = { title: "Connected apps" };

export default async function IntegrationsPage() {
  const workspace = await api<CurrentWorkspace>("/workspaces/current");
  const [connections, catalog, accounts, projects] = await Promise.all([
    api<Connection[]>("/integrations"),
    api<CatalogEntry[]>("/integrations/catalog"),
    api<Account[]>("/accounts"),
    workspace.kind === "business" ? api<Project[]>("/projects") : Promise.resolve([] as Project[]),
  ]);
  return (
    <PageShell frame="settings" title="Connected apps">
      <ConnectionsView connections={connections} catalog={catalog} accounts={accounts} projects={projects} />
    </PageShell>
  );
}
