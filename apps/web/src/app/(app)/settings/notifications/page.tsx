import { NotificationSettings } from "@/features/settings/account-settings";
import { SettingsPage } from "@/features/settings/settings-page";

export const metadata = { title: "Notifications" };

export default function Page() {
  return (
    <SettingsPage title="Notifications" description="When and how FinWise reminds you.">
      <NotificationSettings />
    </SettingsPage>
  );
}
