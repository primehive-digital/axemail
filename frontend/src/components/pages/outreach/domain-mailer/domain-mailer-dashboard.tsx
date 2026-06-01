import { DomainMailComposer } from "@/components/pages/outreach/domain-mailer/domain-mail-composer";
import { DomainMailerStatusSection } from "@/components/pages/outreach/domain-mailer/domain-mailer-status-section";

export function DomainMailerDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <DomainMailerStatusSection />
      <DomainMailComposer />
    </div>
  );
}
