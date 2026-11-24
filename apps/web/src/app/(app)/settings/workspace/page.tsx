import { Suspense } from "react";
import { SettingsPage } from "@/features/settings/settings-page";
import { WorkspaceSettings } from "@/features/settings/workspace-settings";
import type { TeamInvitation, TeamMember } from "@/features/teams/shared";
import { api } from "@/shared/api/server";
import type { CurrentWorkspace } from "@/shared/api/types";

export const metadata = { title: "Workspace" };

export default async function Page() {
  const [members, workspace] = await Promise.all([api<TeamMember[]>("/workspaces/current/members"), api<CurrentWorkspace>("/workspaces/current")]);
  // Invitations carry addresses and links: only owners and admins see them.
  const canManage = workspace.role === "owner" || workspace.role === "admin";
  const invitations = canManage ? await api<TeamInvitation[]>("/workspaces/current/invitations") : null;
  return (
    <SettingsPage
      title="Workspace & members"
      description="Personal and business books stay separate: each workspace has its own accounts, categories, reports and people."
    >
      <Suspense>
        <WorkspaceSettings members={members} invitations={invitations} />
      </Suspense>
    </SettingsPage>
  );
}
