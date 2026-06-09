"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { AllocationPoolSection } from "@/components/pages/administration/allocation-management/allocation-pool-section";
import { AllocationTableCard } from "@/components/pages/administration/allocation-management/allocation-table-card";
import { BotAllocationTableCard } from "@/components/pages/administration/allocation-management/bot-allocation-table-card";
import {
  assignAllocation,
  assignWorkerAllocation,
  getAllocationManagementDashboard,
  type AssignAllocationPayload,
  type AssignWorkerAllocationPayload,
} from "@/lib/allocation-management/allocation-management-api";

const queryKey = ["allocation-management-dashboard"];

export function AllocationManagementDashboard() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey,
    queryFn: getAllocationManagementDashboard,
  });

  const allocationMutation = useMutation({
    mutationFn: (input: AssignAllocationPayload) => assignAllocation(input),
    onSuccess: () => {
      toast.success("Mailer allocation updated successfully.");
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update mailer allocation."),
  });

  const workerAllocationMutation = useMutation({
    mutationFn: (input: AssignWorkerAllocationPayload) => assignWorkerAllocation(input),
    onSuccess: () => {
      toast.success("Worker allocation updated successfully.");
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update worker allocation."),
  });

  const data = query.data;

  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <AllocationPoolSection pools={data?.pools ?? []} isLoading={query.isLoading} />
      <AllocationTableCard
        pools={data?.pools ?? []}
        rows={data?.rows ?? []}
        users={data?.assignableUsers ?? []}
        isLoading={query.isLoading}
        onAssignAllocation={(input) => allocationMutation.mutateAsync(input)}
        isAssigning={allocationMutation.isPending}
      />
      <BotAllocationTableCard
        pools={data?.pools ?? []}
        rows={data?.workerRows ?? []}
        bots={data?.assignableWorkers ?? []}
        isLoading={query.isLoading}
        onAssignAllocation={(input) => workerAllocationMutation.mutateAsync({ workerId: input.userId, gmail: input.gmail, domain: input.domain, mask: input.mask })}
        isAssigning={workerAllocationMutation.isPending}
      />
    </div>
  );
}
