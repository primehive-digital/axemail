import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MAILER_TYPE, type MailerType } from "@/constants/enum";

import { deliveryFields } from "./template-sender-data";
import { MaskFromEmailField, TemplateSenderInput } from "./template-sender-fields";

export function DeliveryDetailsCard({ selectedMailer, disabled }: { selectedMailer: MailerType; disabled?: boolean }) {
  const isMaskMailer = selectedMailer === MAILER_TYPE.MASK;

  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">Delivery Details</h2>
          <p className="font-inter text-sm text-muted-foreground">Configure recipient, sender, and subject details for this template send.</p>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 px-5 py-5 md:grid-cols-2">
        {isMaskMailer && <MaskFromEmailField disabled={disabled} />}
        {deliveryFields.map((field) => (
          <TemplateSenderInput key={field.name} {...field} disabled={disabled} readOnly={field.name === "subjectPreview"} />
        ))}
      </CardContent>
    </Card>
  );
}