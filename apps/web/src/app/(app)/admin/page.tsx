import { AdminPage } from "@/features/admin/admin-page";
import { type AdminOverview, AdminOverviewView } from "@/features/admin/admin-views";
import { type AdminSystem, SystemStatus } from "@/features/admin/system-status";
import { api } from "@/shared/api/server";

export const metadata = { title: "Admin" };

export default async function Page() {
  const [data, system] = await Promise.all([api<AdminOverview>("/admin/overview"), api<AdminSystem>("/admin/system").catch(() => null)]);
  return (
    <AdminPage title="Platform" description="This FinWise instance as a whole. No workspace's financial records are shown here.">
      {system && <SystemStatus data={system} />}
      <AdminOverviewView data={data} />
    </AdminPage>
  );
}
