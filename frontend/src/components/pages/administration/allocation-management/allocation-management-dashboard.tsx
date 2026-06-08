"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { AllocationPoolSection } from "@/components/pages/administration/allocation-management/allocation-pool-section";
import { AllocationTableCard } from "@/components/pages/administration/allocation-management/allocation-table-card";
import {
  applyBotAllocationRows,
  getBotAllocationUsers,
  getBotRemainingPools,
  initialBotAllocationRows,
} from "@/components/pages/administration/allocation-management/bot-allocation-data";
import { BotAllocationTableCard } from "@/components/pages/administration/allocation-management/bot-allocation-table-card";
import {
  assignAllocation,
  getAllocationManagementDashboard,
  type AssignAllocationPayload,
} from "@/lib/allocation-management/allocation-management-api";

const queryKey = ["allocation-management-dashboard"];

export function AllocationManagementDashboard() {
  const queryClient = useQueryClient();
  const [botRows, setBotRows] = useState(initialBotAllocationRows);
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

  const data = query.data;
  const botUsers = useMemo(() => getBotAllocationUsers(botRows), [botRows]);
  const botPools = useMemo(() => getBotRemainingPools(data?.pools ?? [], botRows), [botRows, data?.pools]);

  async function handleAssignBotAllocation(input: AssignAllocationPayload) {
    setBotRows((current) => applyBotAllocationRows(current, input));
    toast.success("Bot allocation updated successfully.");
  }

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
        pools={botPools}
        rows={botRows}
        bots={botUsers}
        onAssignAllocation={handleAssignBotAllocation}
      />
    </div>
  );
}