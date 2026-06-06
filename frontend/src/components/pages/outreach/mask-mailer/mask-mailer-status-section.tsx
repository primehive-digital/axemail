import { MailerCapacityCard } from "@/components/shared/mailer-capacity-card";
import type { MailerStatus } from "@/lib/outreach/outreach-api";

const fallbackStatus = {
  capacity: {
    title: "Mask Capacity",
    allotted: 0,
    sent: 0,
  },
};

export function MaskMailerStatusSection({ status, isLoading }: { status?: MailerStatus; isLoading?: boolean }) {
  const visibleStatus = status ?? fallbackStatus;

  return (
    <section className="grid gap-4">
      {isLoading ? (
        <div className="min-h-52 rounded-xl border border-border bg-card shadow-sm shadow-black/5" />
      ) : (
        <MailerCapacityCard className="w-full" title={visibleStatus.capacity.title} logoSrc="/icons/mask-capacity-logo.png" logoAlt="Mask capacity" allocated={visibleStatus.capacity.allotted} sent={visibleStatus.capacity.sent} />
      )}
    </section>
  );
}