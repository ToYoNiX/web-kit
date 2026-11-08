"use client";

import {
  Canvas,
  CanvasCornerHandle,
  CanvasLabel,
  CanvasResizeHandle,
  useCanvasDrag,
  type CanvasApi,
  type CanvasPoint,
} from "@toyonix/web-kit/react";
import { useState, type Ref } from "react";

/** A rounded rectangle in world units (mm). */
interface Shape {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

const START: Shape = { x: 10, y: 10, width: 119, height: 100, radius: 3 };
const MIN_SIZE = 4;

type Edge = { x: -1 | 0 | 1; y: -1 | 0 | 1; cursor: string };

const HANDLES: Edge[] = [
  { x: -1, y: -1, cursor: "nwse-resize" },
  { x: 0, y: -1, cursor: "ns-resize" },
  { x: 1, y: -1, cursor: "nesw-resize" },
  { x: 1, y: 0, cursor: "ew-resize" },
  { x: 1, y: 1, cursor: "nwse-resize" },
  { x: 0, y: 1, cursor: "ns-resize" },
  { x: -1, y: 1, cursor: "nesw-resize" },
  { x: -1, y: 0, cursor: "ew-resize" },
];

const moved = (shape: Shape, delta: CanvasPoint): Shape => ({
  ...shape,
  x: shape.x + delta.x,
  y: shape.y + delta.y,
});

/** Resizing from one handle: the opposite side stays put. */
function resized(shape: Shape, edge: Edge, delta: CanvasPoint): Shape {
  let { x, y, width, height } = shape;
  if (edge.x === 1) width = Math.max(MIN_SIZE, width + delta.x);
  if (edge.x === -1) {
    width = Math.max(MIN_SIZE, width - delta.x);
    x = shape.x + shape.width - width;
  }
  if (edge.y === 1) height = Math.max(MIN_SIZE, height + delta.y);
  if (edge.y === -1) {
    height = Math.max(MIN_SIZE, height - delta.y);
    y = shape.y + shape.height - height;
  }
  const radius = Math.min(shape.radius, width / 2, height / 2);
  return { x, y, width, height, radius };
}

/** Dragging the top-left corner handle inwards rounds the corners more. */
const rounded = (shape: Shape, delta: CanvasPoint): Shape => ({
  ...shape,
  radius: Math.max(0, Math.min(shape.width / 2, shape.height / 2, shape.radius + (delta.x + delta.y) / 2)),
});

const mm = (value: number) => value.toFixed(1);

function Handle({
  edge,
  shape,
  shown,
  onPreview,
  onCommit,
}: {
  edge: Edge;
  /** The committed shape: resizing starts from it. */
  shape: Shape;
  /** What's on screen (mid-drag, the preview): the handle sits on it. */
  shown: Shape;
  onPreview: (shape: Shape | null) => void;
  onCommit: (shape: Shape) => void;
}) {
  const drag = useCanvasDrag({
    snap: 0.5,
    onMove: (delta) => onPreview(resized(shape, edge, delta)),
    onEnd: (delta) => onCommit(resized(shape, edge, delta)),
    onCancel: () => onPreview(null),
  });
  return (
    <CanvasResizeHandle
      x={shown.x + ((edge.x + 1) / 2) * shown.width}
      y={shown.y + ((edge.y + 1) / 2) * shown.height}
      cursor={edge.cursor}
      {...drag}
    />
  );
}

/**
 * The editable shape. It's rendered inside <Canvas>, because useCanvasDrag (like useCanvas)
 * reads the canvas it's in.
 */
function EditableShape() {
  const [shape, setShape] = useState(START);
  // While dragging: what the shape would become. The committed shape stays as the ghost.
  const [preview, setPreview] = useState<Shape | null>(null);
  const shown = preview ?? shape;

  const commit = (next: Shape) => {
    setShape(next);
    setPreview(null);
  };

  const move = useCanvasDrag({
    snap: 0.5,
    onMove: (delta) => setPreview(moved(shape, delta)),
    onEnd: (delta) => commit(moved(shape, delta)),
    onCancel: () => setPreview(null),
  });
  const round = useCanvasDrag({
    snap: 0.5,
    onMove: (delta) => setPreview(rounded(shape, delta)),
    onEnd: (delta) => commit(rounded(shape, delta)),
    onCancel: () => setPreview(null),
  });

  const corner = shown.radius + 6;

  return (
    <>
      {preview ? (
        <rect
          className="tx-canvas__ghost"
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rx={shape.radius}
        />
      ) : null}
      <rect
        className="tx-canvas__selected"
        x={shown.x}
        y={shown.y}
        width={shown.width}
        height={shown.height}
        rx={shown.radius}
        {...move}
      />
      <CanvasLabel x={shown.x + shown.width / 2} y={shown.y - 4}>
        {mm(shown.width)}
      </CanvasLabel>
      <CanvasLabel x={shown.x + shown.width + 9} y={shown.y + shown.height / 2}>
        {mm(shown.height)}
      </CanvasLabel>
      {HANDLES.map((edge) => (
        <Handle
          key={edge.cursor + edge.x + edge.y}
          edge={edge}
          shape={shape}
          shown={shown}
          onPreview={setPreview}
          onCommit={commit}
        />
      ))}
      <CanvasCornerHandle x={shown.x + corner} y={shown.y + corner} aria-label="Corner radius" {...round} />
      <CanvasLabel x={shown.x + corner + 9} y={shown.y + corner} tone="accent">
        {`r ${mm(shown.radius)}`}
      </CanvasLabel>
    </>
  );
}

/** The demo canvas: one shape to move, resize and round, as in a drawing program. */
export function ShapeCanvas({
  tool,
  onCursorMove,
  onZoom,
  ref,
}: {
  tool: "select" | "pan";
  onCursorMove: (point: CanvasPoint | null) => void;
  onZoom: (scale: number) => void;
  ref?: Ref<CanvasApi>;
}) {
  return (
    <Canvas
      ref={ref}
      aria-label="Drawing"
      bounds={{ x: 0, y: 0, width: 139, height: 120 }}
      tool={tool}
      onCursorMove={onCursorMove}
      onViewChange={(view) => onZoom(view.scale)}
    >
      {/* A reference layer: the key positions the board is drawn around. */}
      {[0, 1, 2, 3].map((column) =>
        [0, 1, 2].map((row) => (
          <rect
            key={`${column}-${row}`}
            className="tx-canvas__ref"
            x={22 + column * 19}
            y={22 + row * 19}
            width={18}
            height={18}
          />
        )),
      )}
      <EditableShape />
    </Canvas>
  );
}
