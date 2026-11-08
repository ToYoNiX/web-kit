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
  /**
   * Width when open, e.g. 360 or "24rem". Default 340px. With `resizable`, this is where the
   * panel starts and what a double-click on the edge goes back to; a new value from the app
   * (e.g. a saved width, read after mount) replaces the user's width.
   */
  width?: number | string;
  /** A shortcut shown in the hide button's tooltip. Binding the key is up to the app. */
  shortcut?: ReactNode;
  /** Extra buttons in the panel's header, before the hide button. */
  actions?: ReactNode;
  /**
   * Lets the user resize the open panel by dragging its inner edge (or, focused, with the arrow
   * keys, Home and End). Not on narrow screens, where the panel opens over the page.
   */
  resizable?: boolean;
  /** Smallest width in px when resizing. Default 220. */
  minWidth?: number;
  /** Largest width in px when resizing. Default 720. */
  maxWidth?: number;
  /** Called with the new width in px when a resize ends, e.g. to remember it. */
  onWidthChange?: (width: number) => void;
}

const RESIZE_STEP = 16;
const RESIZE_STEP_LARGE = 64;

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
  resizable = false,
  minWidth = 220,
  maxWidth = 720,
  onWidthChange,
  className,
  style,
  children,
  ...props
}: SidePanelProps) {
  const { userWidth, dragging, handle } = useResize({
    side,
    title,
    width,
    minWidth,
    maxWidth,
    onWidthChange,
  });
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
  const shownWidth = resizable && userWidth !== null ? userWidth : width;
  const panelStyle = {
    "--tx-side-panel-width": typeof shownWidth === "number" ? `${shownWidth}px` : shownWidth,
    ...style,
  } as CSSProperties;

  return (
    <aside
      className={cx("tx-side-panel", `tx-side-panel--${side}`, className)}
      data-state={open ? "open" : "closed"}
      data-resizing={dragging ? "" : undefined}
      aria-label={title}
      style={panelStyle}
      {...props}
    >
      {resizable && open ? handle : null}
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

interface ResizeOptions {
  side: "left" | "right";
  title: string;
  width: number | string;
  minWidth: number;
  maxWidth: number;
  onWidthChange?: (width: number) => void;
}

/**
 * The resize handle of a SidePanel (the "window splitter" pattern: a focusable separator with
 * its value) and the width the user gave it. While dragging, the width is live and only
 * reported to the app at the end.
 */
function useResize({ side, title, width, minWidth, maxWidth, onWidthChange }: ResizeOptions) {
  // The user's width in px; null follows the app's `width`.
  const [userWidth, setUserWidth] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; startWidth: number; width: number } | null>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  // A new width from the app (e.g. a saved one, read after mount) replaces the user's.
  const [appWidth, setAppWidth] = useState(width);
  if (width !== appWidth) {
    setAppWidth(width);
    setUserWidth(null);
  }

  // While dragging, the whole page shows the resize cursor and nothing gets text-selected.
  useEffect(() => {
    if (!dragging) return;
    document.documentElement.classList.add("tx-resizing");
    return () => document.documentElement.classList.remove("tx-resizing");
  }, [dragging]);

  const clamp = (value: number) => Math.round(Math.min(maxWidth, Math.max(minWidth, value)));
  const currentWidth = () =>
    userWidth ??
    (typeof width === "number"
      ? width
      : (handleRef.current?.parentElement?.getBoundingClientRect().width ?? minWidth));
  const commit = (next: number) => {
    const value = clamp(next);
    setUserWidth(value);
    onWidthChange?.(value);
  };
  // Moving the pointer away from the panel's outer edge makes it wider.
  const grow = side === "left" ? 1 : -1;

  const endDrag = () => {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    setDragging(false);
    commit(current.width);
  };

  const shown = userWidth ?? (typeof width === "number" ? width : undefined);

  const handle = (
    <div
      ref={handleRef}
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${title}`}
      aria-valuenow={shown}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      tabIndex={0}
      className="tx-side-panel__resize"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        const startWidth = currentWidth();
        drag.current = { startX: event.clientX, startWidth, width: startWidth };
        setDragging(true);
      }}
      onPointerMove={(event) => {
        const current = drag.current;
        if (!current) return;
        current.width = clamp(current.startWidth + (event.clientX - current.startX) * grow);
        setUserWidth(current.width);
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onDoubleClick={() => {
        setUserWidth(null);
        if (typeof width === "number") onWidthChange?.(width);
      }}
      onKeyDown={(event) => {
        const step = event.shiftKey ? RESIZE_STEP_LARGE : RESIZE_STEP;
        if (event.key === "ArrowRight") commit(currentWidth() + step * grow);
        else if (event.key === "ArrowLeft") commit(currentWidth() - step * grow);
        else if (event.key === "Home") commit(minWidth);
        else if (event.key === "End") commit(maxWidth);
        else return;
        event.preventDefault();
      }}
    />
  );

  return { userWidth, dragging, handle };
}

/**
 * A thin bar of small facts at the bottom of a Workspace (cursor position, zoom, hints). Each
 * child becomes a segment; put a Spacer between the left and right groups.
 */
export function StatusBar({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-status-bar", className)} {...props} />;
}
