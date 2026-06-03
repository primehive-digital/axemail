import { MailerAllocationCard } from "@/components/shared/mailer-allocation-card";
import { MAILER_TYPE } from "@/constants/enum";
import type { AllocationPool } from "@/lib/allocation-management/allocation-management-api";

const poolMeta: Record<string, { logoSrc: string; logoAlt: string }> = {
  [MAILER_TYPE.GMAIL]: {
    logoSrc: "/icons/gmail-allocation-logo.png",
    logoAlt: "Gmail mailer allocation",
  },
  [MAILER_TYPE.DOMAIN]: {
    logoSrc: "/icons/domain-allocation-logo.png",
    logoAlt: "Domain mailer allocation",
  },
  [MAILER_TYPE.MASK]: {
    logoSrc: "/icons/mask-allocation-logo.png",
    logoAlt: "Mask mailer allocation",
  },
  total: {
    logoSrc: "/icons/total-allocation-logo.png",
    logoAlt: "Total mailer allocation",
  },
};

const fallbackPools: AllocationPool[] = [
  {
    mailerType: MAILER_TYPE.GMAIL,
    title: "Gmail Pool",
    description: "Daily Gmail allocation.",
    assigned: 0,
    limit: 0,
    remaining: 0,
    used: 0,
  },
  {
    mailerType: MAILER_TYPE.DOMAIN,
    title: "Domain Pool",
    description: "Daily domain allocation.",
    assigned: 0,
    limit: 0,
    remaining: 0,
    used: 0,
  },
  {
    mailerType: MAILER_TYPE.MASK,
    title: "Mask Pool",
    description: "Daily mask allocation.",
    assigned: 0,
    limit: 0,
    remaining: 0,
    used: 0,
  },
  {
    mailerType: "total",
    title: "Total Pool",
    description: "Combined daily allocation.",
    assigned: 0,
    limit: 0,
    remaining: 0,
    used: 0,
  },
];

function PoolSkeletonCard() {
  return <div className="min-h-52 rounded-xl border border-border bg-card shadow-sm shadow-black/5" />;
}

export function AllocationPoolSection({ pools, isLoading }: { pools: AllocationPool[]; isLoading?: boolean }) {
  const visiblePools = pools.length > 0 ? pools : fallbackPools;

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-google-sans text-2xl font-semibold text-heading">Mailer Pool Allocation</h1>
        <p className="mt-1 max-w-2xl font-inter text-sm text-muted-foreground">
          Review assigned and remaining daily sending capacity across each mailer pool.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {isLoading
          ? fallbackPools.map((pool) => <PoolSkeletonCard key={pool.mailerType} />)
          : visiblePools.map((pool) => {
              const meta = poolMeta[pool.mailerType];

              return (
                <MailerAllocationCard
                  key={pool.mailerType}
                  title={pool.title}
                  description={pool.description}
                  logoSrc={meta.logoSrc}
                  logoAlt={meta.logoAlt}
                  assigned={pool.assigned}
                  limit={pool.limit}
                />
              );
            })}
      </div>
    </section>
  );
}