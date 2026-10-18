"use client";

import type { ReactNode } from "react";
import { ROOT_APP_ID, appHref, getAppId } from "../env";
import { navApps, type Registry, type RegistryApp } from "../registry";
import { ThemeToggle } from "./ThemeToggle";
import { useRegistry } from "./use-registry";

export interface AppShellProps {
  children: ReactNode;
  /** Build-time registry snapshot from `getRegistrySnapshot()`, so the nav is in the static HTML. */
  registry?: Registry | null;
  /** This app's nav title, used if the registry doesn't list it yet (e.g. a brand-new app). */
  appTitle?: string;
  /** App-local links, shown in a bar under the shared header. Set aria-current yourself. */
  nav?: ReactNode;
  /** Replaces the default footer content. */
  footer?: ReactNode;
}

/**
 * The shared toyonix chrome: header with the logo, cross-app nav, and theme toggle; optional
 * app-local nav; main; footer. Every app renders its pages inside it.
 */
export function AppShell({ children, registry, appTitle, nav, footer }: AppShellProps) {
  const appId = getAppId();
  const apps: RegistryApp[] = navApps(useRegistry(registry));
  if (appId !== ROOT_APP_ID && !apps.some((app) => app.id === appId)) {
    apps.push({
      id: appId,
      title: appTitle ?? appId,
      description: "",
      path: appHref(appId),
      status: "live",
      nav: true,
      order: Number.MAX_SAFE_INTEGER,
    });
  }

  return (
    <>
      <a className="tx-skip-link" href="#main">
        Skip to content
      </a>
      <header className="tx-header">
        <div className="tx-container tx-header__inner">
          <a className="tx-logo" href="/">
            <span className="tx-logo__mark" aria-hidden="true">
              t
            </span>
            <span>toyonix</span>
          </a>
          <nav className="tx-nav" aria-label="toyonix apps">
            <a href="/" aria-current={appId === ROOT_APP_ID ? "true" : undefined}>
              Home
            </a>
            {apps.map((app) => (
              <a key={app.id} href={app.path} aria-current={app.id === appId ? "true" : undefined}>
                {app.title}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>
      {nav ? (
        <nav className="tx-subnav" aria-label="Section">
          <div className="tx-container tx-subnav__inner">{nav}</div>
        </nav>
      ) : null}
      <main id="main" className="tx-main">
        {children}
      </main>
      <footer className="tx-footer">
        <div className="tx-container tx-footer__inner">
          {footer ?? (
            <>
              <span suppressHydrationWarning>© {new Date().getFullYear()} ToYoNiX</span>
              <span>
                built with <a href="https://github.com/ToYoNiX/web-kit">@toyonix/web-kit</a>
              </span>
            </>
          )}
        </div>
      </footer>
    </>
  );
}
