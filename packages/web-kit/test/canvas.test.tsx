import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Canvas,
  CanvasResizeHandle,
  useCanvasDrag,
  type CanvasApi,
  type CanvasPoint,
  type CanvasView,
} from "../src/react";

// The viewport is 848 × 648 px; content 100 × 50 units fits at 8 px per unit (24 px padding),
// with its middle (50, 25) at the viewport's middle (424, 324).
const SIZE = { width: 848, height: 648 };
const BOUNDS = { x: 0, y: 0, width: 100, height: 50 };
const FITTED: CanvasView = { x: -3, y: -15.5, scale: 8 };

beforeEach(() => {
  // jsdom doesn't lay out: report the viewport size the way a browser would.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback([{ target, contentRect: SIZE } as unknown as ResizeObserverEntry], this);
      }
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(cleanup);

const canvas = () => screen.getByRole("group", { name: "Drawing" });
const svg = () => canvas().querySelector("svg")!;

describe("Canvas", () => {
  it("first shows the content whole and centered", () => {
    // Arrange / Act
    render(<Canvas aria-label="Drawing" bounds={BOUNDS} />);

    // Assert: the viewBox is the visible part of the world, 848/8 × 648/8 units
    expect(svg().getAttribute("viewBox")).toBe("-3 -15.5 106 81");
  });

  it("zooms with the wheel around the pointer", () => {
    // Arrange
    const onViewChange = vi.fn();
    render(<Canvas aria-label="Drawing" bounds={BOUNDS} onViewChange={onViewChange} />);

    // Act: wheel up over the content's middle
    fireEvent.wheel(canvas(), { deltaY: -100, clientX: 424, clientY: 324 });

    // Assert: closer, and the point under the pointer stays put
    const view = onViewChange.mock.lastCall?.[0] as CanvasView;
    expect(view.scale).toBeGreaterThan(FITTED.scale);
    expect(view.x + 424 / view.scale).toBeCloseTo(50);
    expect(view.y + 324 / view.scale).toBeCloseTo(25);
  });

  it("pans by dragging with the pan tool", () => {
    // Arrange
    const onViewChange = vi.fn();
    render(<Canvas aria-label="Drawing" bounds={BOUNDS} tool="pan" onViewChange={onViewChange} />);

    // Act
    fireEvent.pointerDown(canvas(), { button: 0, clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(canvas(), { clientX: 140, clientY: 116, pointerId: 1 });
    fireEvent.pointerUp(canvas(), { clientX: 140, clientY: 116, pointerId: 1 });

    // Assert: 40 px right and 16 px down at 8 px per unit
    expect(onViewChange).toHaveBeenLastCalledWith({ x: -8, y: -17.5, scale: 8 });
    expect(canvas().hasAttribute("data-panning")).toBe(false);
  });

  it("pans with the middle button, but not with a plain left drag while selecting", () => {
    // Arrange
    const onViewChange = vi.fn();
    render(<Canvas aria-label="Drawing" bounds={BOUNDS} onViewChange={onViewChange} />);

    // Act: left drag in the select tool
    fireEvent.pointerDown(canvas(), { button: 0, clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(canvas(), { clientX: 180, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(canvas(), { pointerId: 1 });
    const afterLeftDrag = onViewChange.mock.calls.length;
    // middle drag
    fireEvent.pointerDown(canvas(), { button: 1, clientX: 100, clientY: 100, pointerId: 2 });
    fireEvent.pointerMove(canvas(), { clientX: 108, clientY: 100, pointerId: 2 });
    fireEvent.pointerUp(canvas(), { pointerId: 2 });

    // Assert
    expect(afterLeftDrag).toBe(0);
    expect(onViewChange).toHaveBeenLastCalledWith({ x: -4, y: -15.5, scale: 8 });
  });

  it("zooms and fits from the app through its ref", () => {
    // Arrange
    const ref = createRef<CanvasApi>();
    render(<Canvas aria-label="Drawing" bounds={BOUNDS} ref={ref} />);

    // Act
    act(() => ref.current?.zoomIn());
    const zoomedIn = ref.current?.view.scale;
    act(() => ref.current?.fit());

    // Assert
    expect(zoomedIn).toBeGreaterThan(FITTED.scale);
    expect(ref.current?.view).toEqual(FITTED);
  });

  it("draws the minor grid only while its dots are far enough apart", () => {
    // Arrange
    const grid = { minor: 5, major: 25 };
    const { rerender } = render(<Canvas aria-label="Drawing" view={FITTED} grid={grid} />);
    const closeUp = svg().querySelectorAll(".tx-canvas__grid").length;

    // Act: 0.5 px per unit puts 5-unit dots 2.5 px apart
    rerender(<Canvas aria-label="Drawing" view={{ x: 0, y: 0, scale: 0.5 }} grid={grid} />);

    // Assert
    expect(closeUp).toBe(2);
    expect(svg().querySelectorAll(".tx-canvas__grid")).toHaveLength(1);
  });

  it("reports where the pointer is, in world units", () => {
    // Arrange
    const onCursorMove = vi.fn();
    render(<Canvas aria-label="Drawing" view={FITTED} onCursorMove={onCursorMove} />);

    // Act
    fireEvent.pointerMove(canvas(), { clientX: 424, clientY: 324 });
    fireEvent.pointerLeave(canvas());

    // Assert
    expect(onCursorMove.mock.calls).toEqual([[{ x: 50, y: 25 }], [null]]);
  });

  it("keeps handles the same size on screen at any zoom", () => {
    // Arrange / Act
    render(
      <Canvas aria-label="Drawing" view={FITTED}>
        <CanvasResizeHandle x={10} y={10} aria-label="Resize from the top-left corner" />
      </Canvas>,
    );

    // Assert: 9 px at 8 px per unit
    const face = canvas().querySelector(".tx-canvas__handle-face");
    expect(face?.getAttribute("width")).toBe("1.125");
  });
});

/** A shape that can be dragged, reporting what useCanvasDrag tells it. */
function Draggable(props: {
  onMove: (delta: CanvasPoint) => void;
  onEnd: (delta: CanvasPoint) => void;
  onCancel: () => void;
}) {
  const drag = useCanvasDrag({ snap: 0.5, ...props });
  return <rect data-testid="shape" x={0} y={0} width={10} height={10} {...drag} />;
}

describe("useCanvasDrag", () => {
  it("reports how far a shape was dragged in world units, snapped (Shift drags freely)", () => {
    // Arrange
    const handlers = {
      onMove: vi.fn<(delta: CanvasPoint) => void>(),
      onEnd: vi.fn<(delta: CanvasPoint) => void>(),
      onCancel: vi.fn(),
    };
    render(
      <Canvas aria-label="Drawing" view={FITTED}>
        <Draggable {...handlers} />
      </Canvas>,
    );
    const shape = screen.getByTestId("shape");

    // Act: 28 px is 3.5 units; 29 px is 3.625, snapped to 3.5 unless Shift is held
    fireEvent.pointerDown(shape, { button: 0, clientX: 400, clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(shape, { clientX: 428, clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(shape, { clientX: 429, clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(shape, { clientX: 429, clientY: 300, pointerId: 1, shiftKey: true });
    fireEvent.pointerUp(shape, { clientX: 429, clientY: 300, pointerId: 1, shiftKey: true });

    // Assert
    expect(handlers.onMove.mock.calls.map(([delta]) => delta)).toEqual([
      { x: 3.5, y: 0 },
      { x: 3.5, y: 0 },
      { x: 3.625, y: 0 },
    ]);
    expect(handlers.onEnd.mock.calls.map(([delta]) => delta)).toEqual([{ x: 3.625, y: 0 }]);
    expect(handlers.onCancel).not.toHaveBeenCalled();
  });

  it("cancels a drag on Escape", () => {
    // Arrange
    const handlers = {
      onMove: vi.fn<(delta: CanvasPoint) => void>(),
      onEnd: vi.fn<(delta: CanvasPoint) => void>(),
      onCancel: vi.fn(),
    };
    render(
      <Canvas aria-label="Drawing" view={FITTED}>
        <Draggable {...handlers} />
      </Canvas>,
    );
    const shape = screen.getByTestId("shape");
    fireEvent.pointerDown(shape, { button: 0, clientX: 400, clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(shape, { clientX: 440, clientY: 300, pointerId: 1 });

    // Act
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.pointerUp(shape, { clientX: 440, clientY: 300, pointerId: 1 });

    // Assert
    expect(handlers.onCancel).toHaveBeenCalledTimes(1);
    expect(handlers.onEnd).not.toHaveBeenCalled();
  });

  it("doesn't start while the pan tool is on: the canvas pans instead", () => {
    // Arrange
    const handlers = {
      onMove: vi.fn<(delta: CanvasPoint) => void>(),
      onEnd: vi.fn<(delta: CanvasPoint) => void>(),
      onCancel: vi.fn(),
    };
    const onViewChange = vi.fn();
    render(
      <Canvas aria-label="Drawing" view={FITTED} tool="pan" onViewChange={onViewChange}>
        <Draggable {...handlers} />
      </Canvas>,
    );
    const shape = screen.getByTestId("shape");

    // Act
    fireEvent.pointerDown(shape, { button: 0, clientX: 400, clientY: 300, pointerId: 1 });
    fireEvent.pointerMove(shape, { clientX: 440, clientY: 300, pointerId: 1 });
    fireEvent.pointerUp(shape, { clientX: 440, clientY: 300, pointerId: 1 });

    // Assert
    expect(handlers.onMove).not.toHaveBeenCalled();
    expect(onViewChange).toHaveBeenCalled();
  });
});
