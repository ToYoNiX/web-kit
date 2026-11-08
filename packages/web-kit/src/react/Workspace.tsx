"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cx } from "./cx";
import { IconButton } from "./IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

/**
 * The frame of a tool page: a column that fills its parent (use it inside
 * `<AppShell layout="app">`), usually a Toolbar, then WorkspaceBody, then a StatusBar.
 * Controls inside are compact.
 */
export function Workspace({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-workspace", "tx-compact", className)} {...props} />;
}

/** The row between the toolbar and the status bar: side panels around WorkspaceMain. */
export function WorkspaceBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-workspace__body", className)} {...props} />;
}

/** The central area (a canvas, a preview). Takes the space the side panels leave. */
export function WorkspaceMain({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-workspace__main", className)} {...props} />;
}

export interface SidePanelProps extends Omit<ComponentProps<"aside">, "title"> {
  side: "left" | "right";
  /** Shown in the panel's header and on the tab left behind when it is hidden. */
  title: string;
  /** Controlled open state. Leave it out (and use `defaultOpen`) to let the panel manage it. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Width when open, e.g. 360 or "24rem". Default 340px. */
  width?: number | string;
  /** A shortcut shown in the hide button's tooltip. Binding the key is up to the app. */
  shortcut?: ReactNode;
  /** Extra buttons in the panel's header, before the hide button. */
  actions?: ReactNode;
}

/**
 * A panel on the side of a WorkspaceBody that can be hidden. It slides closed to a thin tab
 * with its title (click the tab to bring it back). On narrow screens it opens over the main
 * area instead of squeezing it.
 */
export function SidePanel({
  side,
  title,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  width = 340,
  shortcut,
  actions,
  className,
  style,
  children,
  ...props
}: SidePanelProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const contentId = useId();
  const tabRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Set when the panel's own buttons toggle it: focus follows to what's visible next.
  const moveFocus = useRef(false);

  const setOpen = (next: boolean) => {
    moveFocus.current = true;
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    if (open) contentRef.current?.querySelector<HTMLElement>(".tx-side-panel__head button")?.focus();
    else tabRef.current?.focus();
  }, [open]);

  const HideIcon = side === "left" ? ChevronLeftIcon : ChevronRightIcon;
  const panelStyle = {
    "--tx-side-panel-width": typeof width === "number" ? `${width}px` : width,
    ...style,
  } as CSSProperties;

  return (
    <aside
      className={cx("tx-side-panel", `tx-side-panel--${side}`, className)}
      data-state={open ? "open" : "closed"}
      aria-label={title}
      style={panelStyle}
      {...props}
    >
      <div ref={contentRef} id={contentId} className="tx-side-panel__content" inert={!open}>
        <div className="tx-side-panel__head">
          <span className="tx-side-panel__title">{title}</span>
          {actions}
          <IconButton
            size="sm"
            label={`Hide ${title}`}
            shortcut={shortcut}
            aria-expanded={true}
            aria-controls={contentId}
            onClick={() => setOpen(false)}
          >
            <HideIcon />
          </IconButton>
        </div>
        <div className="tx-side-panel__body">{children}</div>
      </div>
      <button
        ref={tabRef}
        type="button"
        className="tx-side-panel__tab"
        aria-label={`Show ${title}`}
        aria-expanded={false}
        aria-controls={contentId}
        inert={open}
        onClick={() => setOpen(true)}
      >
        {title}
      </button>
    </aside>
  );
}

/**
 * A thin bar of small facts at the bottom of a Workspace (cursor position, zoom, hints). Each
 * child becomes a segment; put a Spacer between the left and right groups.
 */
export function StatusBar({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-status-bar", className)} {...props} />;
}
