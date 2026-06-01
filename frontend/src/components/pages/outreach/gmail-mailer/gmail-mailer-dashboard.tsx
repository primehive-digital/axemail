import { GmailMailComposer } from "@/components/pages/outreach/gmail-mailer/gmail-mail-composer";
import { GmailMailerStatusSection } from "@/components/pages/outreach/gmail-mailer/gmail-mailer-status-section";

export function GmailMailerDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <GmailMailerStatusSection />
      <GmailMailComposer />
    </div>
  );
}
