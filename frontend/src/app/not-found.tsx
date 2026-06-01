"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="w-screen h-svh bg-dark-background flex flex-col items-center justify-center gap-4">
      <h1 className="font-google-sans text-dark-heading font-bold uppercase md:text-7xl text-5xl">
        Error_404
      </h1>

      <Button
        onClick={() => router.push("/")}
        className="mt-6 px-8 rounded-full bg-primary font-google-sans text-sm font-medium text-primary-foreground transition hover:bg-primary-hover border-none"
      >
        <ArrowLeft strokeWidth={3} />
        Return Home
      </Button>
    </div>
  );
}
