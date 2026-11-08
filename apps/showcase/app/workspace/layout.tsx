import type { ReactNode } from "react";
import { AppShell } from "@toyonix/web-kit/react";

// A tool page: the whole window, no shared header or footer. The page brings its own way home.
export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell layout="app" header={false}>
      {children}
    </AppShell>
  );
}
