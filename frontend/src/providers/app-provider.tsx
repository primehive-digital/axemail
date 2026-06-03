"use client";

import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import { AuthBootstrap } from "@/components/providers/auth-bootstrap";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import { ReduxProvider } from "@/providers/redux-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <TooltipProvider>
          <AuthBootstrap />
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
            !bg-white
            !text-heading
            !rounded-[18px]
            !border
            !border-border
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
                  secondary: "#fff",
                },
              },

              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },

              loading: {
                iconTheme: {
                  primary: "#3b82f6",
                  secondary: "#fff",
                },
              },
            }}
          />

          {children}
        </TooltipProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
