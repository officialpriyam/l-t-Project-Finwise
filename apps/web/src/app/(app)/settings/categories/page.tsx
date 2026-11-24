import { CategorySettings } from "@/features/settings/catalog-settings";
import { SettingsPage } from "@/features/settings/settings-page";
import { api } from "@/shared/api/server";
import type { Category } from "@/shared/api/types";

export const metadata = { title: "Categories" };

export default async function Page() {
  const categories = await api<Category[]>("/categories", { query: { includeArchived: true } });
  return (
    <SettingsPage title="Categories" description="Subcategories roll up into their parent in every report and budget.">
      <CategorySettings categories={categories} />
    </SettingsPage>
  );
}
