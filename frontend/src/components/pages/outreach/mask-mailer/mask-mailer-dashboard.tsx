import { MaskMailComposer } from "@/components/pages/outreach/mask-mailer/mask-mail-composer";
import { MaskMailerStatusSection } from "@/components/pages/outreach/mask-mailer/mask-mailer-status-section";

export function MaskMailerDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <MaskMailerStatusSection />
      <MaskMailComposer />
    </div>
  );
}
