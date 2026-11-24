"use client";

import type { CSSProperties, ReactNode } from "react";
import { AppProvider } from "@/features/app/app-context";
import { AppSidebar } from "@/features/app/app-sidebar";
import { CommandPalette } from "@/features/app/command-palette";
import { MobileTabBar } from "@/features/app/mobile-tab-bar";
import { GlobalTransactionForm } from "@/features/app/transaction-form";
import { PlanLimitDialog } from "@/features/billing/plan-limit-dialog";
import { SupportAgent } from "@/features/support/support-agent";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { TooltipProvider } from "@/shared/ui/tooltip";
import type { CurrentWorkspace, Me } from "@/shared/api/types";

/**
 * TeamOS's frame: an inset sidebar beside a rounded content card on desktop,
 * edge-to-edge with a bottom tab bar on a phone.
 */
export function AppShell({ me, workspace, inboxCount, children }: { me: Me; workspace: CurrentWorkspace; inboxCount: number; children: ReactNode }) {
  return (
    <AppProvider me={me} workspace={workspace}>
      <TooltipProvider>
        <div className="app-height flex w-full overflow-hidden md:h-auto md:overflow-visible">
          <SidebarProvider
            className="min-h-0 md:min-h-svh"
            defaultOpen={!me.preferences.sidebarCollapsed}
            style={{ "--sidebar-width": "calc(var(--spacing) * 60)" } as CSSProperties}
          >
            <AppSidebar inboxCount={inboxCount} />
            <SidebarInset className="app-frame flex min-h-0 flex-1 flex-col overflow-auto pb-tab-bar md:m-2 md:rounded-2xl md:border md:border-white/50 md:pb-0 md:shadow-[0_1px_1px_rgb(15_23_42/0.06),0_24px_60px_-32px_rgb(15_23_42/0.35)] dark:md:border-white/10">
              {children}
            </SidebarInset>
            <MobileTabBar inboxCount={inboxCount} />
            <CommandPalette />
            <GlobalTransactionForm />
            <PlanLimitDialog />
            <SupportAgent />
          </SidebarProvider>
        </div>
      </TooltipProvider>
    </AppProvider>
  );
}
