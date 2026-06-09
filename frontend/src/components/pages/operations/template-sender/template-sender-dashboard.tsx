"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MAILER_TYPE, type MailerType } from "@/constants/enum";
import { getTemplateSenderDashboard, sendTemplateMail, type EmailTemplate, type SendTemplatePayload } from "@/lib/templates/templates-api";

import { DeliveryDetailsCard } from "./delivery-details-card";
import { TemplateDetailsCard } from "./template-details-card";
import { TemplateSenderStatusSection } from "./template-sender-status-section";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function TemplateSenderDashboard() {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedMailer, setSelectedMailer] = useState<MailerType>(MAILER_TYPE.GMAIL);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [replyTo, setReplyTo] = useState("");
  const queryKey = ["template-sender-dashboard", selectedMailer];
  const query = useQuery({ queryKey, queryFn: () => getTemplateSenderDashboard(selectedMailer) });
  const templates = useMemo(() => query.data?.templates ?? [], [query.data?.templates]);
  const activeTemplateId = selectedTemplateId && templates.some((template) => template.id === selectedTemplateId) ? selectedTemplateId : templates[0]?.id ?? "";
  const selectedTemplate = useMemo(() => templates.find((template) => template.id === activeTemplateId), [activeTemplateId, templates]);
  const cooldownTotalSeconds = query.data?.cooldown.secondsRemaining ?? 0;
  const replyToOptions = query.data?.replyToOptions ?? [];
  const selectedReplyTo = replyToOptions.some((option) => option.email === replyTo) ? replyTo : replyToOptions[0]?.email ?? "";
  const isQuotaAvailable = Boolean(query.data && query.data.capacity.allotted > 0 && query.data.capacity.remaining > 0);
  const isCooldownActive = selectedMailer !== MAILER_TYPE.MASK && cooldownRemaining > 0;
  const sendMutation = useMutation({
    mutationFn: async (input: SendTemplatePayload) => {
      const result = await sendTemplateMail(input);
      if (result.status === "failed") throw new Error("Template mail failed to send.");
      return result;
    },
    onSuccess: (result) => {
      if (result.status === "partial") toast.success("Template mail partially sent. Review delivery status.");
      else toast.success("Template mail sent successfully.");
      resetRecipientField();
      setCooldownRemaining(selectedMailer === MAILER_TYPE.MASK ? 0 : cooldownTotalSeconds);
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to send template mail."),
  });
  const disabled = Boolean(query.isLoading || sendMutation.isPending || isCooldownActive || !isQuotaAvailable || !selectedTemplate || replyToOptions.length === 0);


  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timeoutId = window.setTimeout(() => setCooldownRemaining((value) => Math.max(value - 1, 0)), 1000);
    return () => window.clearTimeout(timeoutId);
  }, [cooldownRemaining]);

  function resetRecipientField() {
    const toInput = formRef.current?.elements.namedItem("to") as HTMLInputElement | null;
    if (toInput) toInput.value = "";
  }

  function handleMailerChange(mailerType: MailerType) {
    setSelectedMailer(mailerType);
    setSelectedTemplateId("");
    setCooldownRemaining(0);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (query.isLoading) return toast.error("Template sender is still loading.");
    if (!selectedTemplate) return toast.error("Select an active template before sending.");
    if (!isQuotaAvailable) return toast.error("No remaining mailer allocation is available.");
    if (isCooldownActive) return toast.error("Please wait for the cooldown to finish before sending another template mail.");

    const payload = buildPayload(new FormData(event.currentTarget), selectedTemplate, selectedMailer, replyToOptions);
    if (!payload) return;
    await sendMutation.mutateAsync(payload);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <TemplateSenderStatusSection
        selectedMailer={selectedMailer}
        selectedTemplateId={activeTemplateId}
        data={query.data}
        templates={templates}
        disabled={sendMutation.isPending}
        cooldownRemaining={cooldownRemaining}
        cooldownTotalSeconds={cooldownTotalSeconds}
        onMailerChange={handleMailerChange}
        onTemplateChange={setSelectedTemplateId}
      />

      <section className="grid grid-cols-1 gap-4">
        <TemplateDetailsCard template={selectedTemplate} disabled={disabled} />
        <DeliveryDetailsCard selectedMailer={selectedMailer} disabled={disabled} replyToOptions={replyToOptions} replyTo={selectedReplyTo} onReplyToChange={setReplyTo} />

        <div className="flex justify-end">
          <Button disabled={disabled} className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20 disabled:cursor-not-allowed disabled:opacity-70">
            {sendMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            {query.isLoading ? "Loading" : !isQuotaAvailable ? "No Allocation" : isCooldownActive ? "Cooldown Active" : sendMutation.isPending ? "Sending..." : "Send Mail"}
          </Button>
        </div>
      </section>
    </form>
  );
}

function buildPayload(formData: FormData, template: EmailTemplate, mailerType: MailerType, replyToOptions: Array<{ email: string }>): SendTemplatePayload | null {
  const fromName = requiredValue(formData, "fromName", "From Name");
  const to = requiredValue(formData, "to", "To");
  const replyTo = requiredValue(formData, "replyTo", "Reply-To");
  const fromEmailName = String(formData.get("fromEmailName") ?? "").trim();
  const fromEmailExtension = String(formData.get("fromEmailExtension") ?? "").trim();

  if (!fromName || !to || !replyTo) return null;
  if (!validateEmailList(to)) return toast.error("Enter valid recipient email addresses."), null;
  if (!replyToOptions.some((option) => option.email === replyTo)) return toast.error("Select an approved reply-to email."), null;

  const templateValues: Record<string, string> = {};
  for (const field of template.fields) {
    const value = String(formData.get(`field:${field.key}`) ?? "").trim();
    if (field.required && !value) return toast.error(`${field.label} is required.`), null;
    templateValues[field.key] = value;
  }

  if (mailerType === MAILER_TYPE.MASK && !fromEmailName) {
    toast.error("From Email is required.");
    return null;
  }

  return {
    templateId: template.id,
    mailerType,
    fromName,
    fromEmail: mailerType === MAILER_TYPE.MASK ? `${fromEmailName}@uspto.${fromEmailExtension}` : undefined,
    to,
    replyTo,
    previewText: String(formData.get("previewText") ?? "").trim(),
    templateValues,
  };
}

function requiredValue(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) {
    toast.error(`${label} is required.`);
    return null;
  }
  return value;
}

function validateEmailList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean).every((email) => emailPattern.test(email));
}






