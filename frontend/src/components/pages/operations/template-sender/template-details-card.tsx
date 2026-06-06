import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { EmailTemplate } from "@/lib/templates/templates-api";

import { TemplateVariableInput } from "./template-sender-fields";

export function TemplateDetailsCard({ template, disabled }: { template?: EmailTemplate; disabled?: boolean }) {
  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">Template Details</h2>
          <p className="font-inter text-sm text-muted-foreground">Provide values for the selected template variables.</p>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 px-5 py-5 md:grid-cols-2">
        {template?.fields.length ? (
          template.fields.map((field) => (
            <TemplateVariableInput key={field.key} name={field.key} label={field.label} placeholder={field.placeholder} required={field.required} type={field.type} disabled={disabled} />
          ))
        ) : (
          <p className="md:col-span-2 font-inter text-sm text-muted-foreground">Select a template to view its required fields.</p>
        )}
      </CardContent>
    </Card>
  );
}