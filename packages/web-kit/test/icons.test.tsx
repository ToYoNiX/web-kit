import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import * as kit from "../src/react";

afterEach(cleanup);

const icons = Object.entries(kit).filter(([name]) => name.endsWith("Icon")) as [
  string,
  (props: { className?: string }) => React.ReactElement,
][];

describe("icons", () => {
  it("include the canvas and shape icons", () => {
    // Arrange
    const names = icons.map(([name]) => name);

    // Assert
    expect(names).toEqual(
      expect.arrayContaining([
        "RectangleIcon",
        "RoundedRectangleIcon",
        "CircleIcon",
        "PolygonIcon",
        "PillIcon",
        "PathIcon",
        "HandIcon",
        "FitIcon",
        "GridIcon",
        "MagnetIcon",
        "RotateIcon",
        "LayersIcon",
        "CornerIcon",
      ]),
    );
  });

  it.each(icons)("%s is a decorative 24px line icon", (_name, Icon) => {
    // Act
    const { container } = render(<Icon className="extra" />);
    const svg = container.querySelector("svg");

    // Assert
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("focusable")).toBe("false");
    expect(svg?.getAttribute("stroke")).toBe("currentColor");
    expect(svg?.classList.contains("tx-icon")).toBe(true);
    expect(svg?.classList.contains("extra")).toBe(true);
    expect(svg?.childElementCount).toBeGreaterThan(0);
  });
});
