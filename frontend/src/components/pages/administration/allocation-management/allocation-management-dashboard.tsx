import { AllocationPoolSection } from "@/components/pages/administration/allocation-management/allocation-pool-section";
import { AllocationTableCard } from "@/components/pages/administration/allocation-management/allocation-table-card";

export function AllocationManagementDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <AllocationPoolSection />
      <AllocationTableCard />
    </div>
  );
}
