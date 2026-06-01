import { MailerAllocationCard } from "@/components/shared/mailer-allocation-card";

const allocationCards = [
  {
    title: "Gmail Pool",
    description: "Daily Gmail allocation.",
    logoSrc: "/icons/gmail-allocation-logo.png",
    logoAlt: "Gmail mailer allocation",
    assigned: 24,
    limit: 40,
  },
  {
    title: "Domain Pool",
    description: "Daily domain allocation.",
    logoSrc: "/icons/domain-allocation-logo.png",
    logoAlt: "Domain mailer allocation",
    assigned: 18,
    limit: 30,
  },
  {
    title: "Mask Pool",
    description: "Daily mask allocation.",
    logoSrc: "/icons/mask-allocation-logo.png",
    logoAlt: "Mask mailer allocation",
    assigned: 12,
    limit: 25,
  },
  {
    title: "Total Pool",
    description: "Combined daily allocation.",
    logoSrc: "/icons/total-allocation-logo.png",
    logoAlt: "Total mailer allocation",
    assigned: 54,
    limit: 95,
  },
];

export function AllocationPoolSection() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-google-sans text-2xl font-semibold text-heading">
          Mailer Pool Allocation
        </h1>
        <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">
          Review assigned and remaining daily sending capacity across each
          mailer pool.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {allocationCards.map((card) => (
          <MailerAllocationCard key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
