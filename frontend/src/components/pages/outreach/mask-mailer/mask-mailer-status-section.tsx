import { MailerCapacityCard } from "@/components/shared/mailer-capacity-card";

const maskMailerData = {
  capacity: {
    title: "Mask Capacity",
    logoSrc: "/icons/mask-capacity-logo.png",
    logoAlt: "Mask capacity",
    allocated: 100,
    sent: 18,
  },
};

export function MaskMailerStatusSection() {
  return (
    <section className="grid gap-4">
      <MailerCapacityCard className="w-full" {...maskMailerData.capacity} />
    </section>
  );
}
