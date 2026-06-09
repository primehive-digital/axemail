import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MAILER_TYPE, type MailerType } from "@/constants/enum";

import { deliveryFields } from "./template-sender-data";
import type { TemplateReplyToOption } from "@/lib/templates/templates-api";

import { MaskFromEmailField, TemplateReplyToField, TemplateSenderInput } from "./template-sender-fields";

export function DeliveryDetailsCard({ selectedMailer, disabled, replyToOptions, replyTo, onReplyToChange }: { selectedMailer: MailerType; disabled?: boolean; replyToOptions: TemplateReplyToOption[]; replyTo: string; onReplyToChange: (value: string) => void }) {
  const isMaskMailer = selectedMailer === MAILER_TYPE.MASK;

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">Delivery Details</h2>
          <p className="font-inter text-sm text-muted-foreground">Configure recipient and sender details for this template send.</p>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 px-5 py-5 md:grid-cols-2">
        {isMaskMailer && <MaskFromEmailField disabled={disabled} />}
        <TemplateReplyToField options={replyToOptions} value={replyTo} onChange={onReplyToChange} disabled={disabled} />
        {deliveryFields.map((field) => <TemplateSenderInput key={field.name} {...field} disabled={disabled} />)}
      </CardContent>
    </Card>
  );
}



