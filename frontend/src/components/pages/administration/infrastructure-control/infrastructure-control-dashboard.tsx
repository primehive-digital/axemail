import { MaskMailerServerCard } from "@/components/pages/administration/infrastructure-control/mask-mailer-server-card";
import { SendingPolicySection } from "@/components/pages/administration/infrastructure-control/sending-policy-section";
import { SmtpMailerStatusTable } from "@/components/pages/administration/infrastructure-control/smtp-mailer-status-table";

export function InfrastructureControlDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <SendingPolicySection />
      <SmtpMailerStatusTable />
      <MaskMailerServerCard />
    </div>
  );
}
