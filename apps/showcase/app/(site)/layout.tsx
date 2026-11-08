import type { ReactNode } from "react";
import { AppShell } from "@toyonix/web-kit/react";
import { getRegistrySnapshot } from "@toyonix/web-kit/registry";
import { demoRegistry } from "../demo-registry";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const registry = (await getRegistrySnapshot()) ?? demoRegistry;
  return (
    <AppShell registry={registry} appTitle="Web Kit">
      {children}
    </AppShell>
  );
}
