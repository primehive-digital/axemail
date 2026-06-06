import { MailCooldownCard } from "@/components/shared/mail-cooldown-card";
import { MailerCapacityCard } from "@/components/shared/mailer-capacity-card";
import type { MailerStatus } from "@/lib/outreach/outreach-api";

const fallbackStatus = {
  capacity: {
    title: "Gmail Capacity",
    allotted: 0,
    sent: 0,
  },
  cooldown: {
    secondsRemaining: 0,
  },
};

function StatusSkeletonCard({ className }: { className?: string }) {
  return <div className={className ?? ""}><div className="min-h-52 rounded-xl border border-border bg-card shadow-sm shadow-black/5" /></div>;
}

export function GmailMailerStatusSection({ status, isLoading, cooldownTotalSeconds }: { status?: MailerStatus; isLoading?: boolean; cooldownTotalSeconds?: number }) {
  const visibleStatus = status ?? fallbackStatus;
  const totalSeconds = Math.max(cooldownTotalSeconds ?? status?.cooldown.secondsRemaining ?? 0, 1);

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {isLoading ? (
        <>
          <StatusSkeletonCard className="lg:col-span-2" />
          <StatusSkeletonCard className="lg:col-span-1" />
        </>
      ) : (
        <>
          <MailerCapacityCard className="lg:col-span-2" title={visibleStatus.capacity.title} logoSrc="/icons/gmail-capacity-logo.png" logoAlt="Gmail capacity" allocated={visibleStatus.capacity.allotted} sent={visibleStatus.capacity.sent} />
          <MailCooldownCard className="lg:col-span-1" title="Mail Cooldown" remainingSeconds={visibleStatus.cooldown.secondsRemaining} totalSeconds={totalSeconds} />
        </>
      )}
    </section>
  );
}