import RepairBookingWizard from "@/components/RepairBookingWizard";
import { getPhoneCatalogCached } from "@/lib/server/catalog";
import { getRepairTypesCached } from "@/lib/server/repair-catalog";

export const revalidate = 300;

export default async function RepairPage() {
  const [catalog, repairTypes] = await Promise.all([
    getPhoneCatalogCached(),
    getRepairTypesCached(),
  ]);

  return (
    <RepairBookingWizard
      initialCatalog={catalog}
      initialRepairTypes={repairTypes}
    />
  );
}
