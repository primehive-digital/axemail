"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  MAILER_TYPE,
  TEMPLATE_KEY,
  type MailerType,
  type TemplateKey,
} from "@/constants/enum";

import { DeliveryDetailsCard } from "./delivery-details-card";
import { TemplateDetailsCard } from "./template-details-card";
import { TemplateSenderStatusSection } from "./template-sender-status-section";

export function TemplateSenderDashboard() {
  const [selectedMailer, setSelectedMailer] = useState<MailerType>(
    MAILER_TYPE.GMAIL,
  );
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>(
    TEMPLATE_KEY.TEMPLATE_01,
  );

  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <TemplateSenderStatusSection
        selectedMailer={selectedMailer}
        selectedTemplate={selectedTemplate}
        onMailerChange={setSelectedMailer}
        onTemplateChange={setSelectedTemplate}
      />

      <section className="grid grid-cols-1 gap-4">
        <TemplateDetailsCard />
        <DeliveryDetailsCard selectedMailer={selectedMailer} />

        <div className="flex justify-end">
          <Button className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20">
            <Send className="size-4" />
            Send Mail
          </Button>
        </div>
      </section>
    </div>
  );
}
