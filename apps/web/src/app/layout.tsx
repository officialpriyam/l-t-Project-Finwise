import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Aurora } from "@/features/app/aurora";
import { ToastProvider } from "@/shared/ui/toast";
import { ThemeScript } from "./theme-script";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FinWise", template: "%s · FinWise" },
  description: "Your personal and business finances in one place: capture, connect, understand, act.",
  applicationName: "FinWise",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Aurora />
        <ToastProvider position="bottom-right">{children}</ToastProvider>
      </body>
    </html>
  );
}
