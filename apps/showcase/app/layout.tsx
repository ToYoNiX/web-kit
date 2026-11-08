import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeScript } from "@toyonix/web-kit/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "web-kit showcase · toyonix",
  description: "Every @toyonix/web-kit component, rendered with the real package.",
};

// Each route group picks its AppShell: (site) is a normal page, workspace/ a full-window tool page.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
