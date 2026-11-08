import { describe, expect, it } from "vitest";
import { fitView, gridSteps, panBy, snapTo, toScreen, toWorld, zoomAt } from "../src/react/canvas-math";

describe("canvas math", () => {
  it("fits content inside the viewport with padding, centered", () => {
    // Arrange
    const bounds = { x: 0, y: 0, width: 100, height: 50 };
    const size = { width: 848, height: 648 };

    // Act
    const view = fitView(bounds, size, { padding: 24 });

    // Assert: width is the limit, (848 - 48) / 100 = 8 px per unit
    expect(view.scale).toBe(8);
    // Centered: the content's middle (50, 25) is the viewport's middle (424, 324).
    expect(toScreen(view, { x: 50, y: 25 })).toEqual({ x: 424, y: 324 });
  });

  it("keeps the scale within limits when fitting", () => {
    // Act
    const tiny = fitView(
      { x: 0, y: 0, width: 0.001, height: 0.001 },
      { width: 800, height: 600 },
      { maxScale: 50 },
    );

    // Assert
    expect(tiny.scale).toBe(50);
  });

  it("converts between screen and world coordinates", () => {
    // Arrange
    const view = { x: 10, y: -5, scale: 4 };

    // Act
    const world = toWorld(view, { x: 40, y: 20 });

    // Assert
    expect(world).toEqual({ x: 20, y: 0 });
    expect(toScreen(view, world)).toEqual({ x: 40, y: 20 });
  });

  it("zooms around a point, which stays under the pointer", () => {
    // Arrange
    const view = { x: 0, y: 0, scale: 2 };
    const pointer = { x: 200, y: 100 };
    const before = toWorld(view, pointer);

    // Act
    const zoomed = zoomAt(view, 2, pointer, { minScale: 0.1, maxScale: 100 });

    // Assert
    expect(zoomed.scale).toBe(4);
    expect(toWorld(zoomed, pointer)).toEqual(before);
  });

  it("stops zooming at the limits", () => {
    // Act
    const zoomed = zoomAt({ x: 0, y: 0, scale: 90 }, 2, { x: 0, y: 0 }, { minScale: 0.1, maxScale: 100 });

    // Assert
    expect(zoomed.scale).toBe(100);
  });

  it("pans by a distance on screen", () => {
    // Act: dragging the content 40 px right moves the view 10 units left at 4 px per unit
    const panned = panBy({ x: 0, y: 0, scale: 4 }, { x: 40, y: -8 });

    // Assert
    expect(panned).toEqual({ x: -10, y: 2, scale: 4 });
  });

  it("snaps to a step, and leaves values alone without one", () => {
    // Act / Assert
    expect(snapTo(11.26, 0.5)).toBe(11.5);
    expect(snapTo(-40.74, 0.5)).toBe(-40.5);
    expect(snapTo(3.14159, 0)).toBe(3.14159);
  });

  it("thins the grid out when zoomed out so dots never crowd", () => {
    // Act
    const close = gridSteps(4, { minor: 5, major: 25 });
    const far = gridSteps(0.5, { minor: 5, major: 25 });
    const veryFar = gridSteps(0.05, { minor: 5, major: 25 });

    // Assert: at 4 px/unit both show; at 0.5 the 5-unit dots would be 2.5 px apart
    expect(close).toEqual({ minor: 5, major: 25 });
    expect(far).toEqual({ minor: null, major: 25 });
    // At 0.05 px/unit even 25 units is 1.25 px: the major step grows by 5s until it's at least
    // 6 px apart (125 units = 6.25 px).
    expect(veryFar).toEqual({ minor: null, major: 125 });
  });
});
