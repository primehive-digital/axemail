"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import toast from "react-hot-toast";
import { LoaderCircle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MAILER_TYPE, type MailerType } from "@/constants/enum";
import {
  createReplyToOption,
  deleteReplyToOption,
  getMailerCustomizationDashboard,
  updateCooldownSchedule,
  updateReplyToOption,
  type MailerCustomization,
  type ReplyToOption,
  type ReplyToOptionPayload,
} from "@/lib/mailer-customization/mailer-customization-api";
import { cn } from "@/lib/utils";

import { CooldownSettingsCard } from "./cooldown-settings-card";
import { ReplyToOptionDialog } from "./reply-to-option-dialog";
import { ReplyToOptionsCard } from "./reply-to-options-card";

const queryKey = ["mailer-customization-dashboard"];
const mailerOrder = [MAILER_TYPE.GMAIL, MAILER_TYPE.DOMAIN, MAILER_TYPE.MASK] satisfies MailerType[];

export function MailerCustomizationDashboard() {
  const queryClient = useQueryClient();
  const [selectedMailerType, setSelectedMailerType] = useState<MailerType>(MAILER_TYPE.GMAIL);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<ReplyToOption | null>(null);
  const query = useQuery({ queryKey, queryFn: getMailerCustomizationDashboard });
  const mailers = useMemo(() => {
    const data = query.data?.mailers ?? [];
    return [...data].sort((left, right) => mailerOrder.indexOf(left.mailerType) - mailerOrder.indexOf(right.mailerType));
  }, [query.data?.mailers]);
  const selectedMailer = mailers.find((mailer) => mailer.mailerType === selectedMailerType) ?? mailers[0];

  const createMutation = useMutation({
    mutationFn: createReplyToOption,
    onSuccess: async () => {
      toast.success("Reply-to option added successfully.");
      setAddDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to add reply-to option."),
  });
  const updateMutation = useMutation({
    mutationFn: (input: { optionId: string; payload: Omit<ReplyToOptionPayload, "mailerType"> }) => updateReplyToOption(input.optionId, input.payload),
    onSuccess: async () => {
      toast.success("Reply-to option updated successfully.");
      setEditingOption(null);
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update reply-to option."),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteReplyToOption,
    onSuccess: async () => {
      toast.success("Reply-to option deleted successfully.");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to delete reply-to option."),
  });
  const cooldownMutation = useMutation({
    mutationFn: (input: { mailerType: MailerType; schedule: number[] }) => updateCooldownSchedule(input.mailerType, input.schedule),
    onSuccess: async () => {
      toast.success("Cooldown schedule updated successfully.");
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update cooldown schedule."),
  });

  function handleCreate(payload: Omit<ReplyToOptionPayload, "mailerType">) {
    if (!selectedMailer) return;
    createMutation.mutate({ ...payload, mailerType: selectedMailer.mailerType });
  }

  function handleUpdate(payload: Omit<ReplyToOptionPayload, "mailerType">) {
    if (!editingOption) return;
    updateMutation.mutate({ optionId: editingOption.id, payload });
  }

  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-google-sans text-2xl font-semibold text-heading">Mailer Customization</h1>
          <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">
            Manage reply-to options and cooldown behavior for each mailer pool.
          </p>
        </div>
        <Button type="button" variant="outline" disabled={query.isFetching} onClick={() => query.refetch()} className="h-10 w-fit rounded-full bg-background px-4 font-google-sans shadow-sm shadow-black/5 transition-all duration-200 ease-in-out hover:bg-secondary">
          {query.isFetching ? <LoaderCircle className="size-4 animate-spin" /> : <RotateCw className="size-4" />}
          Refresh data
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {query.isLoading
          ? [MAILER_TYPE.GMAIL, MAILER_TYPE.DOMAIN, MAILER_TYPE.MASK].map((type) => <MailerPickerSkeleton key={type} />)
          : mailers.map((mailer) => (
              <MailerPickerCard
                key={mailer.mailerType}
                mailer={mailer}
                selected={selectedMailerType === mailer.mailerType}
                onSelect={() => setSelectedMailerType(mailer.mailerType)}
              />
            ))}
      </section>

      {selectedMailer && (
        <section className="grid gap-12">
          <ReplyToOptionsCard
            mailer={selectedMailer}
            deletingOptionId={deleteMutation.variables}
            isDeleting={deleteMutation.isPending}
            onAdd={() => setAddDialogOpen(true)}
            onEdit={setEditingOption}
            onDelete={(option) => deleteMutation.mutate(option.id)}
          />
          <CooldownSettingsCard
            mailer={selectedMailer}
            isPending={cooldownMutation.isPending && cooldownMutation.variables?.mailerType === selectedMailer.mailerType}
            onSave={(schedule) => cooldownMutation.mutate({ mailerType: selectedMailer.mailerType, schedule })}
          />
        </section>
      )}

      <ReplyToOptionDialog
        mode="add"
        open={addDialogOpen}
        isPending={createMutation.isPending}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleCreate}
      />
      <ReplyToOptionDialog
        mode="edit"
        open={Boolean(editingOption)}
        option={editingOption}
        isPending={updateMutation.isPending}
        onOpenChange={(open) => !open && setEditingOption(null)}
        onSubmit={handleUpdate}
      />
    </div>
  );
}

function MailerPickerCard({ mailer, selected, onSelect }: { mailer: MailerCustomization; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex min-h-32 items-start gap-4 rounded-xl border bg-card p-5 text-left shadow-sm shadow-black/5 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-black/10",
        selected ? "border-primary ring-2 ring-primary/15" : "border-border",
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-full border border-border bg-secondary">
        <Image src={mailer.logoSrc} alt={mailer.title} width={30} height={30} className="size-8 object-contain" />
      </span>
      <span className="min-w-0">
        <span className="block font-google-sans text-lg font-semibold text-heading">{mailer.title}</span>
        <span className="mt-1 block font-inter text-sm leading-5 text-muted-foreground">{mailer.description}</span>
        <span className="mt-3 inline-flex rounded-full border border-border bg-secondary px-3 py-1 font-inter text-xs font-medium text-muted-foreground">
          {mailer.replyToOptions.length} reply-to options
        </span>
      </span>
    </button>
  );
}

function MailerPickerSkeleton() {
  return (
    <div className="min-h-32 rounded-xl border border-border bg-card p-5 shadow-sm shadow-black/5">
      <div className="flex gap-4">
        <div className="size-12 rounded-full bg-secondary" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-36 rounded-sm bg-secondary" />
          <div className="h-4 w-full rounded-sm bg-secondary" />
          <div className="h-7 w-28 rounded-full bg-secondary" />
        </div>
      </div>
    </div>
  );
}



