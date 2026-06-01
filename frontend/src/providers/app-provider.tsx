"use client";

import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <Toaster
        position="top-right"
        gutter={10}
        reverseOrder={false}
        containerStyle={{
          top: 20,
          right: 20,
        }}
        toastOptions={{
          duration: 3500,

          className: `
            !bg-black
            !text-slate-50
            !rounded-[18px]
            !border
            !border-white/10
            !shadow-2xl
            !px-4
            !py-3

            !font-[var(--font-google-sans)]

            !flex
            !items-center
          `,

          style: {
            boxShadow: `
              0 20px 60px rgba(0,0,0,.45),
              inset 0 1px 0 rgba(255,255,255,.03)
            `,
          },

          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#000",
            },
          },

          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#000",
            },
          },

          loading: {
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#000",
            },
          },
        }}
      />

      {children}
    </TooltipProvider>
  );
}
