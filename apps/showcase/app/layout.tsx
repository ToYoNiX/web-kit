import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell, ThemeScript } from "@toyonix/web-kit/react";
import { getRegistrySnapshot } from "@toyonix/web-kit/registry";
import { demoRegistry } from "./demo-registry";
import "./globals.css";

export const metadata: Metadata = {
  title: "web-kit showcase · toyonix",
  description: "Every @toyonix/web-kit component, rendered with the real package.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const registry = (await getRegistrySnapshot()) ?? demoRegistry;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AppShell registry={registry} appTitle="Web Kit">
          {children}
        </AppShell>
      </body>
    </html>
  );
}
