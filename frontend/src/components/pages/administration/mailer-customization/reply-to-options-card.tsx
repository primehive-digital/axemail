"use client";

import { Edit3, LoaderCircle, Plus, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MailerCustomization, ReplyToOption } from "@/lib/mailer-customization/mailer-customization-api";

export function ReplyToOptionsCard({
  mailer,
  deletingOptionId,
  isDeleting,
  onAdd,
  onEdit,
  onDelete,
}: {
  mailer: MailerCustomization;
  deletingOptionId?: string;
  isDeleting?: boolean;
  onAdd: () => void;
  onEdit: (option: ReplyToOption) => void;
  onDelete: (option: ReplyToOption) => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-google-sans text-xl font-semibold text-heading">Reply-To Options</h2>
            <p className="mt-1 font-inter text-sm text-muted-foreground">Approved reply-to addresses for {mailer.title.toLowerCase()}.</p>
          </div>
          <Button type="button" onClick={onAdd} className="h-10 rounded-full border-none bg-black px-4 font-google-sans shadow-sm shadow-black/10 transition-all duration-200 ease-in-out hover:bg-black/80 hover:shadow-md hover:shadow-black/20">
            <Plus className="size-4" />
            Add Reply-To
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="min-h-96 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b bg-secondary/60 text-left font-google-sans text-xs uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-4 font-semibold">Label</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mailer.replyToOptions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-16 text-center font-inter text-sm text-muted-foreground">
                    No reply-to options added for this mailer.
                  </td>
                </tr>
              ) : (
                mailer.replyToOptions.map((option) => (
                  <tr key={option.id} className="border-b last:border-b-0">
                    <td className="px-5 py-4 font-google-sans text-sm font-semibold text-heading">{option.label}</td>
                    <td className="px-5 py-4 font-inter text-sm text-muted-foreground">{option.email}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="icon" onClick={() => onEdit(option)} className="size-9 rounded-full border-none bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700">
                          <Edit3 className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button type="button" size="icon" className="size-9 rounded-full border-none bg-red-50 text-destructive shadow-sm shadow-destructive/10 hover:bg-red-100">
                              {isDeleting && deletingOptionId === option.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete reply-to option?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove {option.email} from the approved reply-to list for this mailer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border border-border bg-transparent hover:bg-secondary">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(option)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

