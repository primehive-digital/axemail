import { MailCooldownCard } from "@/components/shared/mail-cooldown-card";
import { MailerCapacityCard } from "@/components/shared/mailer-capacity-card";

const domainMailerData = {
  capacity: {
    title: "Domain Capacity",
    logoSrc: "/icons/domain-capacity-logo.png",
    logoAlt: "Domain capacity",
    allocated: 100,
    sent: 34,
  },
  cooldown: {
    title: "Mail Cooldown",
    remainingSeconds: 38,
    totalSeconds: 60,
  },
};

export function DomainMailerStatusSection() {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <MailerCapacityCard
        className="lg:col-span-2"
        {...domainMailerData.capacity}
      />
      <MailCooldownCard
        className="lg:col-span-1"
        {...domainMailerData.cooldown}
      />
    </section>
  );
}
