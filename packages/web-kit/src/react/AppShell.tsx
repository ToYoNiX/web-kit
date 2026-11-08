"use client";

import { useEffect, useRef, type ReactNode } from "react";
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
  /**
   * Whether this app gets its own link in the shared header (default `true`). Pass `false` for
   * an app whose package.json says `"nav": false`: otherwise, while the registry doesn't list
   * the app, the header adds it anyway so you can see where you are.
   */
  appNav?: boolean;
  /** App-local links, shown in a bar under the shared header. Set aria-current yourself. */
  nav?: ReactNode;
  /** Replaces the default footer content. */
  footer?: ReactNode;
  /**
   * `page` (default): header, content, footer, and the window scrolls.
   * `app`: a full-window tool page. No footer; `main` fills the window below the header and
   * never scrolls itself, so the app lays out its own scrolling areas (see `Workspace`).
   */
  layout?: "page" | "app";
  /**
   * Show the shared header (default `true`). A tool page can hide it to get the whole window;
   * it should then offer its own way back (a link to the app's home) and a `ThemeToggle`.
   */
  header?: boolean;
}

/**
 * The shared toyonix chrome: header with the logo, cross-app nav, and theme toggle; optional
 * app-local nav; main; footer. Every app renders its pages inside it.
 */
export function AppShell({
  children,
  registry,
  appTitle,
  appNav = true,
  nav,
  footer,
  layout = "page",
  header = true,
}: AppShellProps) {
  const appId = getAppId();
  const currentRegistry = useRegistry(registry);
  const apps: RegistryApp[] = navApps(currentRegistry);
  // An app hidden from the nav (by the registry or by the app itself) is never added back.
  const hidden = !appNav || currentRegistry?.apps.some((app) => app.id === appId && !app.nav) === true;
  const navRef = useRef<HTMLElement>(null);
  const appCount = apps.length;

  // On narrow screens the app links scroll sideways if they don't fit: keep the current app in
  // view, and mark which edges have more links beyond them (the CSS fades those edges as a hint).
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const markEdges = () => {
      const max = nav.scrollWidth - nav.clientWidth;
      nav.toggleAttribute("data-more-left", max > 1 && nav.scrollLeft > 1);
      nav.toggleAttribute("data-more-right", max > 1 && nav.scrollLeft < max - 1);
    };
    const update = () => {
      const current = nav.querySelector<HTMLElement>("[aria-current]");
      if (current && nav.scrollWidth > nav.clientWidth + 1) {
        nav.scrollLeft = current.offsetLeft - (nav.clientWidth - current.offsetWidth) / 2;
      }
      markEdges();
    };
    update();
    nav.addEventListener("scroll", markEdges, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      nav.removeEventListener("scroll", markEdges);
      window.removeEventListener("resize", update);
    };
  }, [appCount]);
  if (appId !== ROOT_APP_ID && !hidden && !apps.some((app) => app.id === appId)) {
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

  const skipLink = (
    <a className="tx-skip-link" href="#main">
      Skip to content
    </a>
  );
  const sharedHeader = header ? (
    <header className="tx-header">
      <div className="tx-container tx-header__inner">
        <a className="tx-logo" href="/">
          <span className="tx-logo__mark" aria-hidden="true">
            t
          </span>
          <span>toyonix</span>
        </a>
        <nav ref={navRef} className="tx-nav" aria-label="toyonix apps">
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
  ) : null;
  const subnav = nav ? (
    <nav className="tx-subnav" aria-label="Section">
      <div className="tx-container tx-subnav__inner">{nav}</div>
    </nav>
  ) : null;

  if (layout === "app") {
    return (
      <div className="tx-app-shell">
        {skipLink}
        {sharedHeader}
        {subnav}
        <main id="main" className="tx-main tx-main--app">
          {children}
        </main>
      </div>
    );
  }

  return (
    <>
      {skipLink}
      {sharedHeader}
      {subnav}
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
