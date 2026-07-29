"use client";

import {
  CircleAlert,
  FlaskConical,
  LoaderCircle,
  LogOut,
  Pencil,
  Trash2,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TableActionKind = "edit" | "delete" | "terminate" | "test";

const actionConfig = {
  edit: {
    label: "Edit",
    icon: Pencil,
    className: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800",
  },
  delete: {
    label: "Delete",
    icon: Trash2,
    className: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800",
  },
  terminate: {
    label: "Terminate",
    icon: LogOut,
    className: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-900",
  },
  test: {
    label: "Test",
    icon: FlaskConical,
    className: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:text-violet-800",
  },
} as const;

export function TableActionButton({
  action,
  label,
  isPending,
  className,
  ...props
}: Omit<ComponentProps<typeof Button>, "variant" | "size"> & {
  action: TableActionKind;
  label?: string;
  isPending?: boolean;
}) {
  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-8 rounded-md px-2.5 font-google-sans text-xs font-semibold shadow-none", config.className, className)}
      {...props}
      disabled={isPending || props.disabled}
    >
      {isPending ? <LoaderCircle className="size-3.5 animate-spin" /> : <Icon className="size-3.5" />}
      {label ?? config.label}
    </Button>
  );
}

export function ConfirmTableAction({
  action,
  title,
  description,
  confirmLabel,
  isPending,
  onConfirm,
  triggerLabel,
}: {
  action: "delete" | "terminate";
  title: string;
  description: ReactNode;
  confirmLabel: string;
  isPending?: boolean;
  onConfirm: () => Promise<unknown> | void;
  triggerLabel?: string;
}) {
  const isDelete = action === "delete";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <TableActionButton action={action} label={triggerLabel} isPending={isPending} />
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl border border-border bg-popover p-6 shadow-2xl shadow-black/20 sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogMedia className={cn("mb-2 size-12 max-md:hidden", isDelete ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800")}>
            {isDelete ? <CircleAlert className="size-6" /> : <LogOut className="size-6" />}
          </AlertDialogMedia>
          <AlertDialogTitle className="font-google-sans text-xl font-semibold text-heading">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-inter text-sm leading-6 text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-md border border-border bg-white font-google-sans text-heading hover:bg-slate-50">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className={cn(
              "rounded-md border font-google-sans font-semibold shadow-none",
              isDelete
                ? "border-red-700 bg-red-700! text-white hover:bg-red-800!"
                : "border-amber-700 bg-amber-700! text-white hover:bg-amber-800!",
            )}
            onClick={onConfirm}
          >
            {isPending && <LoaderCircle className="size-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
