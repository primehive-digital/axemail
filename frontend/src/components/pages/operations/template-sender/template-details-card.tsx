import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { templateDetailFields } from "./template-sender-data";
import { TemplateSenderInput } from "./template-sender-fields";

export function TemplateDetailsCard() {
  return (
    <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b px-5 py-4 pt-6">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">
            Template Details
          </h2>
          <p className="font-inter text-sm text-muted-foreground">
            Provide template variables for the selected template.
          </p>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 px-5 py-5 md:grid-cols-2">
        {templateDetailFields.map((field) => (
          <TemplateSenderInput key={field.id} {...field} />
        ))}
      </CardContent>
    </Card>
  );
}
