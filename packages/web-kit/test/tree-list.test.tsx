import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TreeList, type TreeListItem } from "../src/react";

afterEach(cleanup);

// switch_plate's parts, with plate_cutout's own parts nested under it.
const ITEMS: TreeListItem[] = [
  { id: "plate", label: "plate_cutout", leading: "+", meta: "outline" },
  { id: "footprints", label: "key_footprints", depth: 1, leading: "+", meta: "rect ×18" },
  { id: "board", label: "board_edge", depth: 1, leading: "+", meta: "rectangle" },
  { id: "cavity", label: "controller_cavity", depth: 1, leading: "−", meta: "outline" },
  { id: "switches", label: "key_switch_cutouts", leading: "−", meta: "rect ×18" },
  { id: "holes", label: "mounting_holes", leading: "⧉", meta: "circle ×5", disabled: true },
];

const row = (name: string) => screen.getByRole("treeitem", { name: new RegExp(name) });

/** Drag events in jsdom need a DataTransfer stand-in. */
function dataTransfer() {
  const data = new Map<string, string>();
  return {
    dropEffect: "none",
    effectAllowed: "all",
    setData: (type: string, value: string) => data.set(type, value),
    getData: (type: string) => data.get(type) ?? "",
  };
}

describe("TreeList", () => {
  it("is a tree whose rows know their level and place among their siblings", () => {
    // Arrange / Act
    render(<TreeList aria-label="Shapes" items={ITEMS} selected="board" />);

    // Assert
    expect(screen.getByRole("tree", { name: "Shapes" })).toBeTruthy();
    const board = row("board_edge");
    expect(board.getAttribute("aria-level")).toBe("2");
    expect(board.getAttribute("aria-posinset")).toBe("2");
    expect(board.getAttribute("aria-setsize")).toBe("3");
    expect(board.getAttribute("aria-selected")).toBe("true");
    expect(row("key_switch_cutouts").getAttribute("aria-posinset")).toBe("2");
    expect(board.textContent).toContain("rectangle");
    // Only the selected row is in the tab order (roving tabindex).
    expect(board.tabIndex).toBe(0);
    expect(row("plate_cutout").tabIndex).toBe(-1);
  });

  it("selects a row on click, but not a disabled one", () => {
    // Arrange
    const onSelect = vi.fn();
    render(<TreeList aria-label="Shapes" items={ITEMS} onSelect={onSelect} />);

    // Act
    fireEvent.click(row("controller_cavity"));
    fireEvent.click(row("mounting_holes"));

    // Assert
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("cavity");
  });

  it("moves the selection with the arrow keys, Home and End, skipping disabled rows", () => {
    // Arrange
    const onSelect = vi.fn();
    render(<TreeList aria-label="Shapes" items={ITEMS} selected="cavity" onSelect={onSelect} />);
    const cavity = row("controller_cavity");

    // Act / Assert
    fireEvent.keyDown(cavity, { key: "ArrowDown" });
    expect(onSelect).toHaveBeenLastCalledWith("switches");
    fireEvent.keyDown(cavity, { key: "ArrowUp" });
    expect(onSelect).toHaveBeenLastCalledWith("board");
    fireEvent.keyDown(cavity, { key: "Home" });
    expect(onSelect).toHaveBeenLastCalledWith("plate");
    fireEvent.keyDown(cavity, { key: "End" });
    expect(onSelect).toHaveBeenLastCalledWith("switches");
  });

  it("moves a row among its siblings with Alt+arrows", () => {
    // Arrange
    const onMove = vi.fn();
    render(<TreeList aria-label="Shapes" items={ITEMS} selected="board" onMove={onMove} />);

    // Act
    fireEvent.keyDown(row("board_edge"), { key: "ArrowUp", altKey: true });
    fireEvent.keyDown(row("board_edge"), { key: "ArrowDown", altKey: true });
    // The last child can't move further down: it would leave its parent.
    fireEvent.keyDown(row("controller_cavity"), { key: "ArrowDown", altKey: true });

    // Assert
    expect(onMove.mock.calls).toEqual([
      ["board", 0],
      ["board", 2],
    ]);
  });

  it("moves a row by dragging it before or after a sibling", () => {
    // Arrange
    const onMove = vi.fn();
    render(<TreeList aria-label="Shapes" items={ITEMS} onMove={onMove} />);
    const transfer = dataTransfer();

    // Act: drag the first child below the last one (lower half of the target row)
    fireEvent.dragStart(row("key_footprints"), { dataTransfer: transfer });
    fireEvent.dragOver(row("controller_cavity"), { dataTransfer: transfer, clientY: 5 });
    const indicator = row("controller_cavity").getAttribute("data-drop");
    fireEvent.drop(row("controller_cavity"), { dataTransfer: transfer, clientY: 5 });

    // Assert
    expect(indicator).toBe("after");
    expect(onMove).toHaveBeenCalledWith("footprints", 2);
    expect(row("controller_cavity").hasAttribute("data-drop")).toBe(false);
  });

  it("doesn't accept a drop on a row from another parent", () => {
    // Arrange
    const onMove = vi.fn();
    render(<TreeList aria-label="Shapes" items={ITEMS} onMove={onMove} />);
    const transfer = dataTransfer();

    // Act
    fireEvent.dragStart(row("board_edge"), { dataTransfer: transfer });
    const accepted = fireEvent.dragOver(row("key_switch_cutouts"), { dataTransfer: transfer, clientY: -5 });
    fireEvent.drop(row("key_switch_cutouts"), { dataTransfer: transfer, clientY: -5 });

    // Assert: dragOver wasn't cancelled, so the browser refuses the drop
    expect(accepted).toBe(true);
    expect(onMove).not.toHaveBeenCalled();
  });

  it("can't be reordered without onMove", () => {
    // Arrange / Act
    render(<TreeList aria-label="Shapes" items={ITEMS} />);

    // Assert
    expect(row("board_edge").getAttribute("draggable")).not.toBe("true");
  });
});
