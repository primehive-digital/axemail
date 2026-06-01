import { MailCooldownCard } from "@/components/shared/mail-cooldown-card";
import { MailerCapacityCard } from "@/components/shared/mailer-capacity-card";

const gmailMailerData = {
  capacity: {
    title: "Gmail Capacity",
    logoSrc: "/icons/gmail-capacity-logo.png",
    logoAlt: "Gmail capacity",
    allocated: 100,
    sent: 20,
  },
  cooldown: {
    title: "Mail Cooldown",
    remainingSeconds: 42,
    totalSeconds: 60,
  },
};

export function GmailMailerStatusSection() {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      <MailerCapacityCard
        className="lg:col-span-2"
        {...gmailMailerData.capacity}
      />
      <MailCooldownCard
        className="lg:col-span-1"
        {...gmailMailerData.cooldown}
      />
    </section>
  );
}
