"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
  type SVGProps,
} from "react";
import {
  fitView,
  gridSteps,
  panBy,
  snapTo,
  toWorld,
  zoomAt,
  type CanvasBounds,
  type CanvasPoint,
  type CanvasView,
} from "./canvas-math";
import { cx } from "./cx";

export type { CanvasBounds, CanvasPoint, CanvasView } from "./canvas-math";
export { snapTo } from "./canvas-math";

/** What the app can do with a Canvas through its `ref`. */
export interface CanvasApi {
  /** The current view. */
  view: CanvasView;
  /** Shows all of `bounds` again. */
  fit: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  /** The world point under a screen point (e.g. a pointer event's clientX/clientY). */
  toWorld: (clientX: number, clientY: number) => CanvasPoint;
}

export interface CanvasProps extends Omit<ComponentProps<"div">, "children" | "ref"> {
  /** What the canvas shows, e.g. "Drawing". */
  "aria-label": string;
  /** The content's extent in world units. The canvas fits it until the user pans or zooms. */
  bounds?: CanvasBounds;
  /** Controlled view; leave it out to let the canvas keep its own. */
  view?: CanvasView;
  onViewChange?: (view: CanvasView) => void;
  /** With "pan", dragging anywhere moves the view. Middle-drag and Space+drag always do. */
  tool?: "select" | "pan";
  /** "zoom" (default): the wheel zooms around the pointer. "pan": it scrolls; Ctrl+wheel and pinch zoom. */
  wheel?: "zoom" | "pan";
  /** Dot grid in world units, or false. Default: a dot every 5 units, a bigger one every 25. */
  grid?: false | { minor: number; major: number };
  /** Zoom limits in screen pixels per world unit. Default 0.05 and 200. */
  minScale?: number;
  maxScale?: number;
  /** The world point under the pointer while it moves over the canvas, null when it leaves. */
  onCursorMove?: (point: CanvasPoint | null) => void;
  /** SVG content in world units (y grows downwards, as in SVG). */
  children?: ReactNode;
  /** HTML shown over the canvas, e.g. a floating toolbar. */
  overlay?: ReactNode;
  ref?: Ref<CanvasApi>;
}

interface CanvasContextValue {
  view: CanvasView;
  tool: "select" | "pan";
  toWorld: (clientX: number, clientY: number) => CanvasPoint;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

/** The canvas around a component: its view and coordinate conversion. */
export function useCanvas(): CanvasContextValue {
  const context = useContext(CanvasContext);
  if (!context) throw new Error("useCanvas must be used inside a <Canvas>.");
  return context;
}

const DEFAULT_GRID = { minor: 5, major: 25 };
const ZOOM_STEP = 1.25;
const NO_VIEW: CanvasView = { x: 0, y: 0, scale: 1 };

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * A drawing surface: SVG content in world units (e.g. mm) that the user pans and zooms, over a
 * dot grid. Put it in a WorkspaceMain. The kit draws nothing but the grid: the app renders its
 * shapes as children, using the tx-canvas__* classes and the handles below for the look.
 */
export function Canvas({
  bounds,
  view: viewProp,
  onViewChange,
  tool = "select",
  wheel = "zoom",
  grid = DEFAULT_GRID,
  minScale = 0.05,
  maxScale = 200,
  onCursorMove,
  children,
  overlay,
  ref,
  className,
  ...props
}: CanvasProps) {
  const container = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  // The user's own view once they pan or zoom; until then the content stays fitted.
  const [ownView, setOwnView] = useState<CanvasView | null>(null);
  const [panning, setPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const pan = useRef<{ x: number; y: number } | null>(null);
  const hovered = useRef(false);
  const limits = { minScale, maxScale };

  const fitted = size && bounds ? fitView(bounds, size, limits) : null;
  const view = viewProp ?? ownView ?? fitted ?? NO_VIEW;

  const setView = (next: CanvasView) => {
    setOwnView(next);
    onViewChange?.(next);
  };

  const localPoint = (clientX: number, clientY: number): CanvasPoint => {
    const box = container.current?.getBoundingClientRect();
    return { x: clientX - (box?.left ?? 0), y: clientY - (box?.top ?? 0) };
  };
  const worldAt = (clientX: number, clientY: number) => toWorld(view, localPoint(clientX, clientY));
  const center = () => ({ x: (size?.width ?? 0) / 2, y: (size?.height ?? 0) / 2 });

  useImperativeHandle(ref, () => ({
    view,
    fit: () => {
      if (fitted) setView(fitted);
    },
    zoomIn: () => setView(zoomAt(view, ZOOM_STEP, center(), limits)),
    zoomOut: () => setView(zoomAt(view, 1 / ZOOM_STEP, center(), limits)),
    toWorld: worldAt,
  }));

  // The viewport's size, kept current as panels open, close and resize.
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The wheel needs a non-passive listener to keep the page from scrolling or zooming.
  const latest = useRef({ view, setView, wheel, limits });
  useEffect(() => {
    latest.current = { view, setView, wheel, limits };
  });
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const { view: current, setView: apply, wheel: mode, limits: scaleLimits } = latest.current;
      const box = element.getBoundingClientRect();
      const lines = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? box.height : 1;
      if (event.ctrlKey || mode === "zoom") {
        const factor = Math.exp(-event.deltaY * lines * 0.0015);
        apply(
          zoomAt(current, factor, { x: event.clientX - box.left, y: event.clientY - box.top }, scaleLimits),
        );
      } else {
        apply(panBy(current, { x: -event.deltaX * lines, y: -event.deltaY * lines }));
      }
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  // Space+drag pans while the pointer is over the canvas (not while typing somewhere).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== " " || !hovered.current || isTyping(event.target)) return;
      event.preventDefault();
      setSpaceHeld(true);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === " ") setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const endPan = () => {
    pan.current = null;
    setPanning(false);
  };

  const steps = grid ? gridSteps(view.scale, grid) : null;
  const ids = useId().replace(/[^a-zA-Z0-9]/g, "");
  const visible = size
    ? { x: view.x, y: view.y, width: size.width / view.scale, height: size.height / view.scale }
    : null;

  return (
    <div
      ref={container}
      role="group"
      aria-roledescription="canvas"
      className={cx("tx-canvas", className)}
      data-tool={tool}
      data-space={spaceHeld ? "" : undefined}
      data-panning={panning ? "" : undefined}
      onPointerDownCapture={(event) => {
        const pans = event.button === 1 || (event.button === 0 && (tool === "pan" || spaceHeld));
        if (!pans) return;
        // Panning wins over whatever is under the pointer: shapes don't start a drag.
        event.stopPropagation();
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        pan.current = { x: event.clientX, y: event.clientY };
        setPanning(true);
      }}
      onPointerMove={(event) => {
        onCursorMove?.(worldAt(event.clientX, event.clientY));
        const from = pan.current;
        if (!from) return;
        pan.current = { x: event.clientX, y: event.clientY };
        setView(panBy(view, { x: event.clientX - from.x, y: event.clientY - from.y }));
      }}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      onPointerEnter={() => {
        hovered.current = true;
      }}
      onPointerLeave={() => {
        hovered.current = false;
        onCursorMove?.(null);
      }}
      {...props}
    >
      <svg
        className="tx-canvas__svg"
        viewBox={visible ? `${visible.x} ${visible.y} ${visible.width} ${visible.height}` : undefined}
        preserveAspectRatio="xMinYMin meet"
      >
        {visible && steps ? (
          <>
            <defs>
              {steps.minor ? (
                <pattern
                  id={`${ids}-minor`}
                  width={steps.minor}
                  height={steps.minor}
                  patternUnits="userSpaceOnUse"
                >
                  <circle className="tx-canvas__dot" cx={0} cy={0} r={1 / view.scale} />
                </pattern>
              ) : null}
              <pattern
                id={`${ids}-major`}
                width={steps.major}
                height={steps.major}
                patternUnits="userSpaceOnUse"
              >
                <circle className="tx-canvas__dot" cx={0} cy={0} r={1.6 / view.scale} />
              </pattern>
            </defs>
            {steps.minor ? (
              <rect className="tx-canvas__grid" {...visible} fill={`url(#${ids}-minor)`} />
            ) : null}
            <rect className="tx-canvas__grid" {...visible} fill={`url(#${ids}-major)`} />
          </>
        ) : null}
        <CanvasContext value={{ view, tool, toWorld: worldAt }}>{children}</CanvasContext>
      </svg>
      {overlay}
    </div>
  );
}

export interface CanvasDragOptions {
  /** Snap the drag distance to this step in world units (e.g. 0.5). Shift drags freely. */
  snap?: number;
  onStart?: () => void;
  /** How far the pointer has moved since the drag started, in world units. */
  onMove: (delta: CanvasPoint, event: ReactPointerEvent) => void;
  /** The drag ended: the final distance. */
  onEnd?: (delta: CanvasPoint, event: ReactPointerEvent) => void;
  /** Escape was pressed during the drag: put things back. */
  onCancel?: () => void;
  disabled?: boolean;
}

/**
 * Pointer handlers that turn dragging an SVG element inside a Canvas into distances in world
 * units. Spread the result on the element: `<path {...useCanvasDrag({ onMove })} />`.
 */
export function useCanvasDrag({ snap = 0, onStart, onMove, onEnd, onCancel, disabled }: CanvasDragOptions) {
  const canvas = useCanvas();
  const drag = useRef<{ start: CanvasPoint; stopEscape: () => void } | null>(null);

  const deltaOf = (event: ReactPointerEvent): CanvasPoint => {
    const start = drag.current?.start ?? { x: 0, y: 0 };
    const point = canvas.toWorld(event.clientX, event.clientY);
    const step = event.shiftKey ? 0 : snap;
    return { x: snapTo(point.x - start.x, step), y: snapTo(point.y - start.y, step) };
  };

  const stop = () => {
    drag.current?.stopEscape();
    drag.current = null;
  };

  // A drag still running when the element goes away just stops.
  useEffect(() => () => drag.current?.stopEscape(), []);

  return {
    onPointerDown: (event: ReactPointerEvent) => {
      if (disabled || event.button !== 0) return;
      // The canvas (and shapes underneath) shouldn't also react to this press.
      event.stopPropagation();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const onKeyDown = (key: KeyboardEvent) => {
        if (key.key !== "Escape") return;
        stop();
        onCancel?.();
      };
      window.addEventListener("keydown", onKeyDown);
      drag.current = {
        start: canvas.toWorld(event.clientX, event.clientY),
        stopEscape: () => window.removeEventListener("keydown", onKeyDown),
      };
      onStart?.();
    },
    onPointerMove: (event: ReactPointerEvent) => {
      if (drag.current) onMove(deltaOf(event), event);
    },
    onPointerUp: (event: ReactPointerEvent) => {
      if (!drag.current) return;
      const delta = deltaOf(event);
      stop();
      onEnd?.(delta, event);
    },
    onPointerCancel: () => {
      if (!drag.current) return;
      stop();
      onCancel?.();
    },
  };
}

type Placed<T> = Omit<SVGProps<T>, "x" | "y"> & { x: number; y: number };

const HANDLE_PX = 9;
const CORNER_PX = 8;
const SHADOW_PX = 2;

/** A square resize handle at a world point, the same size on screen at any zoom. */
export function CanvasResizeHandle({
  x,
  y,
  cursor = "nwse-resize",
  className,
  style,
  ...props
}: Placed<SVGGElement> & { cursor?: string }) {
  const { view } = useCanvas();
  const side = HANDLE_PX / view.scale;
  const shadow = SHADOW_PX / view.scale;
  return (
    <g className={cx("tx-canvas__handle", className)} style={{ cursor, ...style }} {...props}>
      <rect
        className="tx-canvas__handle-shadow"
        x={x - side / 2 + shadow}
        y={y - side / 2 + shadow}
        width={side}
        height={side}
      />
      <rect className="tx-canvas__handle-face" x={x - side / 2} y={y - side / 2} width={side} height={side} />
    </g>
  );
}

/** A diamond handle at a world point, e.g. to drag a corner's radius. Same size at any zoom. */
export function CanvasCornerHandle({ x, y, className, ...props }: Placed<SVGRectElement>) {
  const { view } = useCanvas();
  const side = CORNER_PX / view.scale;
  return (
    <rect
      className={cx("tx-canvas__corner", className)}
      x={x - side / 2}
      y={y - side / 2}
      width={side}
      height={side}
      transform={`rotate(45 ${x} ${y})`}
      {...props}
    />
  );
}

/**
 * A small label chip centered on a world point, e.g. a dimension ("119.0") or a radius. Same
 * size at any zoom. `tone="accent"` for the value being edited.
 */
export function CanvasLabel({
  x,
  y,
  tone = "ink",
  children,
  className,
  ...props
}: Placed<SVGGElement> & { tone?: "ink" | "accent"; children: string }) {
  const { view } = useCanvas();
  const unit = 1 / view.scale;
  const fontSize = 11 * unit;
  const width = (children.length * 0.62 * 11 + 10) * unit;
  const height = 17 * unit;
  return (
    <g
      className={cx("tx-canvas__label", tone === "accent" && "tx-canvas__label--accent", className)}
      {...props}
    >
      <rect x={x - width / 2} y={y - height / 2} width={width} height={height} />
      <text x={x} y={y} fontSize={fontSize} textAnchor="middle" dominantBaseline="central">
        {children}
      </text>
    </g>
  );
}
