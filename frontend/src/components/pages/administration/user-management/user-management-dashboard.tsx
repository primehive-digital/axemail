import { UserDirectoryTableCard } from "@/components/pages/administration/user-management/user-directory-table-card";
import { UserManagementMetrics } from "@/components/pages/administration/user-management/user-management-metrics";

export function UserManagementDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <section className="space-y-4">
        <div>
          <h1 className="font-google-sans text-2xl font-semibold text-heading">
            User Management
          </h1>
          <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">
            Monitor users, active sessions, and role distribution across the
            workspace.
          </p>
        </div>

        <UserManagementMetrics />
      </section>

      <UserDirectoryTableCard />
    </div>
  );
}
