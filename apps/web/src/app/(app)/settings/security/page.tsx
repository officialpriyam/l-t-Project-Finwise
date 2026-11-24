import { SecuritySettings } from "@/features/settings/account-settings";
import { SettingsPage } from "@/features/settings/settings-page";

export const metadata = { title: "Security" };

export default function Page() {
  return (
    <SettingsPage title="Security" description="Devices and sessions.">
      <SecuritySettings />
    </SettingsPage>
  );
}
