"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const userProgress = [
  {
    firstName: "Ayesha",
    lastName: "Khan",
    email: "ayesha.khan@axemail.com",
    gmailSent: 18,
    gmailTarget: 25,
    domainSent: 12,
    domainTarget: 18,
    maskSent: 8,
    maskTarget: 12,
  },
  {
    firstName: "Hassan",
    lastName: "Raza",
    email: "hassan.raza@axemail.com",
    gmailSent: 24,
    gmailTarget: 30,
    domainSent: 14,
    domainTarget: 20,
    maskSent: 7,
    maskTarget: 10,
  },
  {
    firstName: "Mariam",
    lastName: "Siddiqui",
    email: "mariam.siddiqui@axemail.com",
    gmailSent: 11,
    gmailTarget: 15,
    domainSent: 9,
    domainTarget: 12,
    maskSent: 5,
    maskTarget: 8,
  },
  {
    firstName: "Usman",
    lastName: "Ali",
    email: "usman.ali@axemail.com",
    gmailSent: 16,
    gmailTarget: 20,
    domainSent: 10,
    domainTarget: 16,
    maskSent: 6,
    maskTarget: 10,
  },
  {
    firstName: "Sana",
    lastName: "Ahmed",
    email: "sana.ahmed@axemail.com",
    gmailSent: 13,
    gmailTarget: 18,
    domainSent: 11,
    domainTarget: 14,
    maskSent: 4,
    maskTarget: 9,
  },
  {
    firstName: "Bilal",
    lastName: "Sheikh",
    email: "bilal.sheikh@axemail.com",
    gmailSent: 19,
    gmailTarget: 22,
    domainSent: 12,
    domainTarget: 15,
    maskSent: 9,
    maskTarget: 11,
  },
];

const rowsPerPage = 5;

function ProgressValue({
  sent,
  target,
  className,
}: {
  sent: number;
  target: number;
  className?: string;
}) {
  return (
    <span className={cn("digits text-lg font-medium text-heading", className)}>
      {sent.toLocaleString()}
      <span className="mx-1 text-sm font-medium text-muted-foreground">/</span>
      <span className="text-sm font-medium text-muted-foreground">
        {target.toLocaleString()}
      </span>
    </span>
  );
}

export function ProgressTrackerTableCard() {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(userProgress.length / rowsPerPage);
  const visibleProgress = useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return userProgress.slice(start, start + rowsPerPage);
  }, [page]);

  return (
    <Card className="gap-0 rounded-xl border-2 border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
      <CardHeader className="border-b-2 px-5 py-4 pt-6">
        <div>
          <h2 className="font-google-sans text-xl font-semibold text-heading">
            Progress Tracker
          </h2>
          <p className="font-inter text-sm text-muted-foreground">
            Review each user&apos;s sent volume against their assigned daily
            limits.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="min-h-97.5 overflow-x-auto">
          <table className="w-full min-w-200 border-collapse">
            <thead>
              <tr className="border-b-2 border-border bg-secondary/60">
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  User
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Gmail
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mask
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Domain
                </th>
                <th className="px-5 py-4 text-left font-google-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleProgress.map((user) => {
                const fullName = `${user.firstName} ${user.lastName}`;
                const totalSent =
                  user.gmailSent + user.maskSent + user.domainSent;
                const totalTarget =
                  user.gmailTarget + user.maskTarget + user.domainTarget;

                return (
                  <tr
                    key={user.email}
                    className="border-b-2 border-border transition-colors last:border-b-0 hover:bg-secondary/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-secondary text-heading">
                          <UserRound className="size-4" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="font-google-sans text-sm font-medium leading-tight text-heading">
                            {fullName}
                          </span>
                          <span className="mt-1 truncate font-inter text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ProgressValue
                        sent={user.gmailSent}
                        target={user.gmailTarget}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <ProgressValue
                        sent={user.maskSent}
                        target={user.maskTarget}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <ProgressValue
                        sent={user.domainSent}
                        target={user.domainTarget}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <ProgressValue
                        sent={totalSent}
                        target={totalTarget}
                        className="text-blue-600 font-semibold!"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t-2 border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={page === 1}
              className="border-none bg-transparent"
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={pageNumber === page ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "size-8 rounded-sm p-0",
                    pageNumber === page
                      ? "bg-black hover:bg-black/80"
                      : "bg-transparent",
                  )}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ),
            )}
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={page === pageCount}
              className="border-none bg-transparent"
              onClick={() => setPage((value) => Math.min(value + 1, pageCount))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
