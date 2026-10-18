"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { Dialog as Primitive } from "radix-ui";
import { cx } from "./cx";

export interface TocItem {
  /** The heading element's id (the anchor). */
  id: string;
  text: string;
  /** 2 for `##`, 3 for `###`. Deeper levels are better left out. */
  depth: 2 | 3;
}

export interface TableOfContentsProps {
  items: TocItem[];
  /** Below this many items nothing renders (a short note doesn't need an index). Default 3. */
  minItems?: number;
  title?: string;
  className?: string;
}

/** How far below the viewport top a heading counts as "current" (clears the sticky header). */
const ACTIVE_OFFSET = 120;

/** The id of the last heading scrolled past, or the first one before any. */
function useActiveHeading(ids: string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(ids[0]);

  useEffect(() => {
    if (ids.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= ACTIVE_OFFSET) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  return active;
}

function TocList({
  items,
  active,
  onNavigate,
}: {
  items: TocItem[];
  active: string | undefined;
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  return (
    <ol className="tx-toc__list">
      {items.map((item) => (
        <li key={item.id} className={cx("tx-toc__item", item.depth === 3 && "tx-toc__item--sub")}>
          <a
            className="tx-toc__link"
            href={`#${item.id}`}
            aria-current={item.id === active ? "location" : undefined}
            onClick={onNavigate ? (event) => onNavigate(event, item.id) : undefined}
          >
            <span className="tx-toc__text">{item.text}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * "On this page" navigation for long articles. Place it as the second child of a `.tx-with-toc`
 * grid, next to the article. Wide screens get a sticky column; narrow screens get a floating
 * button that opens a menu sliding in from the right. Works without JS (plain anchor links);
 * JS adds the current-section highlight and the mobile menu.
 */
export function TableOfContents({
  items,
  minItems = 3,
  title = "On this page",
  className,
}: TableOfContentsProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const idKey = items.map((item) => item.id).join("\n");
  const ids = useMemo(() => (idKey ? idKey.split("\n") : []), [idKey]);
  const active = useActiveHeading(ids);

  // In the mobile menu, close first, then jump once the dialog has released the page scroll.
  const navigateFromMenu = useCallback((event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setPending(id);
    setOpen(false);
  }, []);

  const finishNavigation = useCallback(
    (event: Event) => {
      if (!pending) return;
      event.preventDefault(); // don't move focus back to the trigger; the target heading matters now
      const target = document.getElementById(pending);
      setPending(null);
      if (!target) return;
      history.pushState(null, "", `#${pending}`);
      target.scrollIntoView({ block: "start" });
    },
    [pending],
  );

  if (items.length < minItems) return null;

  return (
    <>
      <nav className={cx("tx-toc", className)} aria-label={title}>
        <p className="tx-section-label tx-toc__title">{title}</p>
        <TocList items={items} active={active} />
      </nav>

      <Primitive.Root open={open} onOpenChange={setOpen}>
        <Primitive.Trigger className="tx-btn tx-btn--primary tx-toc-trigger" aria-label={`Open: ${title}`}>
          <span aria-hidden="true">☰</span> {title}
        </Primitive.Trigger>
        <Primitive.Portal>
          <Primitive.Overlay className="tx-overlay tx-toc-overlay" />
          <Primitive.Content className="tx-toc-drawer" onCloseAutoFocus={finishNavigation}>
            <div className="tx-toc-drawer__head">
              <Primitive.Title className="tx-section-label tx-toc__title">{title}</Primitive.Title>
              <Primitive.Close className="tx-btn tx-btn--ghost tx-toc-drawer__close" aria-label="Close">
                ✕
              </Primitive.Close>
            </div>
            <Primitive.Description className="tx-visually-hidden">
              Jump to a section of this page.
            </Primitive.Description>
            <TocList items={items} active={active} onNavigate={navigateFromMenu} />
          </Primitive.Content>
        </Primitive.Portal>
      </Primitive.Root>
    </>
  );
}
