/**
 * The geometry behind Canvas: a view maps world units (e.g. mm) to screen pixels.
 *
 *   screen = (world - view.{x,y}) * view.scale
 *
 * so view.x/y is the world point at the viewport's top-left corner and view.scale is pixels per
 * world unit. World y grows downwards, like SVG.
 */

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface CanvasView {
  /** World x at the viewport's left edge. */
  x: number;
  /** World y at the viewport's top edge. */
  y: number;
  /** Screen pixels per world unit. */
  scale: number;
}

/** A rectangle in world units. */
export interface CanvasBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScaleLimits {
  minScale: number;
  maxScale: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function toWorld(view: CanvasView, screen: CanvasPoint): CanvasPoint {
  return { x: view.x + screen.x / view.scale, y: view.y + screen.y / view.scale };
}

export function toScreen(view: CanvasView, world: CanvasPoint): CanvasPoint {
  return { x: (world.x - view.x) * view.scale, y: (world.y - view.y) * view.scale };
}

/** The view that shows `bounds` whole and centered in a viewport of `size` pixels. */
export function fitView(
  bounds: CanvasBounds,
  size: { width: number; height: number },
  { padding = 24, minScale = 0.01, maxScale = 1000 }: Partial<ScaleLimits> & { padding?: number } = {},
): CanvasView {
  const room = {
    width: Math.max(1, size.width - 2 * padding),
    height: Math.max(1, size.height - 2 * padding),
  };
  const fitted = Math.min(room.width / (bounds.width || 1), room.height / (bounds.height || 1));
  const scale = clamp(fitted, minScale, maxScale);
  return {
    x: bounds.x + bounds.width / 2 - size.width / 2 / scale,
    y: bounds.y + bounds.height / 2 - size.height / 2 / scale,
    scale,
  };
}

/** Zooms by `factor` around a screen point, which keeps showing the same world point. */
export function zoomAt(
  view: CanvasView,
  factor: number,
  screen: CanvasPoint,
  limits: ScaleLimits,
): CanvasView {
  const scale = clamp(view.scale * factor, limits.minScale, limits.maxScale);
  const anchor = toWorld(view, screen);
  return { x: anchor.x - screen.x / scale, y: anchor.y - screen.y / scale, scale };
}

/** Moves the content by a distance on screen (what dragging the canvas does). */
export function panBy(view: CanvasView, delta: CanvasPoint): CanvasView {
  return { x: view.x - delta.x / view.scale, y: view.y - delta.y / view.scale, scale: view.scale };
}

/** Rounds to the nearest multiple of `step`; a step of 0 leaves the value as it is. */
export function snapTo(value: number, step: number): number {
  if (!step) return value;
  // Rounding the quotient, then cleaning float noise (0.1 + 0.2 style) to the step's precision.
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  return Number((Math.round(value / step) * step).toFixed(decimals));
}

/** Grid dots closer than this on screen are hidden (minor) or spread out (major). */
const MIN_GRID_PX = 6;

/**
 * Which grid steps to draw at a scale: the minor dots only while they're far enough apart, and
 * the major dots at their step, or a multiple of 5 of it once zoomed far out.
 */
export function gridSteps(
  scale: number,
  grid: { minor: number; major: number },
): { minor: number | null; major: number } {
  let major = grid.major;
  while (major * scale < MIN_GRID_PX) major *= 5;
  return { minor: grid.minor * scale >= MIN_GRID_PX ? grid.minor : null, major };
}
