"use client";

import {
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
} from "react";
import { cx } from "./cx";

export interface TreeListItem {
  id: string;
  label: ReactNode;
  /** Nesting level, 0 for top-level rows. Items are listed in display order (parents first). */
  depth?: number;
  /** Shown before the label, e.g. an operation symbol or an icon. */
  leading?: ReactNode;
  /** Shown muted at the end of the row, e.g. "rect ×18". */
  meta?: ReactNode;
  /** Can't be selected or moved. */
  disabled?: boolean;
  /** Can be selected but not moved. */
  fixed?: boolean;
}

export interface TreeListProps extends Omit<ComponentProps<"ul">, "onSelect" | "children"> {
  /** What the list shows, e.g. "Shapes". */
  "aria-label": string;
  items: TreeListItem[];
  selected?: string | null;
  onSelect?: (id: string) => void;
  /**
   * Called when the user moves a row among its siblings, by dragging it or with Alt+↑/↓.
   * `index` is its new position among them (its children move with it). Without onMove, rows
   * can't be moved.
   */
  onMove?: (id: string, index: number) => void;
}

type DropPosition = "before" | "after";

const depthOf = (item: TreeListItem | undefined) => item?.depth ?? 0;

/** Indexes (into `items`) of the item at `index` and its siblings, in order. */
function siblingIndexes(items: TreeListItem[], index: number): number[] {
  const depth = depthOf(items[index]);
  let start = index;
  while (start > 0 && depthOf(items[start - 1]) >= depth) start--;
  const siblings: number[] = [];
  for (let i = start; i < items.length && depthOf(items[i]) >= depth; i++) {
    if (depthOf(items[i]) === depth) siblings.push(i);
  }
  return siblings;
}

/**
 * A list of rows with nesting, such as the layers or parts of a drawing. One row is selected;
 * rows can be reordered among their siblings. Keyboard: ↑/↓, Home and End move the selection,
 * Alt+↑/↓ moves the selected row.
 */
export function TreeList({ items, selected, onSelect, onMove, className, ...props }: TreeListProps) {
  const rows = useRef(new Map<string, HTMLLIElement>());
  const [dragging, setDragging] = useState<string | null>(null);
  const [drop, setDrop] = useState<{ id: string; position: DropPosition } | null>(null);

  const indexOf = (id: string) => items.findIndex((item) => item.id === id);
  const enabled = items.filter((item) => !item.disabled);
  const tabbable =
    selected && enabled.some((item) => item.id === selected) ? selected : (enabled[0]?.id ?? null);

  const select = (id: string | undefined) => {
    if (!id) return;
    onSelect?.(id);
    rows.current.get(id)?.focus();
  };

  const canMove = (item: TreeListItem) => onMove !== undefined && !item.disabled && !item.fixed;

  const moveBy = (index: number, step: -1 | 1) => {
    const item = items[index];
    if (!item || !canMove(item)) return;
    const siblings = siblingIndexes(items, index);
    const to = siblings.indexOf(index) + step;
    if (to >= 0 && to < siblings.length) onMove?.(item.id, to);
  };

  const onKeyDown = (index: number, key: string, altKey: boolean) => {
    if (altKey && (key === "ArrowUp" || key === "ArrowDown")) {
      moveBy(index, key === "ArrowUp" ? -1 : 1);
      return true;
    }
    const position = enabled.findIndex((item) => item.id === items[index]?.id);
    if (key === "ArrowDown") select(enabled[position + 1]?.id);
    else if (key === "ArrowUp") select(enabled[position - 1]?.id);
    else if (key === "Home") select(enabled[0]?.id);
    else if (key === "End") select(enabled.at(-1)?.id);
    else return false;
    return true;
  };

  /** Whether `target` can take a drop of the row being dragged (a sibling, not itself). */
  const accepts = (target: string) => {
    if (!dragging || dragging === target) return false;
    const from = indexOf(dragging);
    return from >= 0 && siblingIndexes(items, from).includes(indexOf(target));
  };

  const dropPosition = (event: DragEvent<HTMLLIElement>): DropPosition => {
    const box = event.currentTarget.getBoundingClientRect();
    return event.clientY < box.top + box.height / 2 ? "before" : "after";
  };

  const endDrag = () => {
    setDragging(null);
    setDrop(null);
  };

  const finishDrop = (target: string, position: DropPosition) => {
    if (!dragging) return;
    const fromIndex = indexOf(dragging);
    const siblings = siblingIndexes(items, fromIndex);
    const from = siblings.indexOf(fromIndex);
    let to = siblings.indexOf(indexOf(target)) + (position === "after" ? 1 : 0);
    if (from < to) to--;
    if (to !== from) onMove?.(dragging, to);
  };

  return (
    <ul role="tree" className={cx("tx-tree-list", className)} {...props}>
      {items.map((item, index) => {
        const siblings = siblingIndexes(items, index);
        const movable = canMove(item);
        return (
          <li
            key={item.id}
            ref={(element) => {
              if (element) rows.current.set(item.id, element);
              else rows.current.delete(item.id);
            }}
            role="treeitem"
            className="tx-tree-list__item"
            style={{ "--tx-tree-depth": depthOf(item) } as CSSProperties}
            aria-level={depthOf(item) + 1}
            aria-setsize={siblings.length}
            aria-posinset={siblings.indexOf(index) + 1}
            aria-selected={item.id === selected}
            aria-disabled={item.disabled || undefined}
            tabIndex={item.id === tabbable ? 0 : -1}
            draggable={movable || undefined}
            data-dragging={dragging === item.id ? "" : undefined}
            data-drop={drop?.id === item.id ? drop.position : undefined}
            onClick={() => {
              if (!item.disabled) select(item.id);
            }}
            onKeyDown={(event) => {
              if (onKeyDown(index, event.key, event.altKey)) event.preventDefault();
            }}
            onDragStart={(event) => {
              if (!movable) {
                event.preventDefault();
                return;
              }
              event.dataTransfer.setData("text/plain", item.id);
              event.dataTransfer.effectAllowed = "move";
              setDragging(item.id);
            }}
            onDragOver={(event) => {
              if (!accepts(item.id)) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              const position = dropPosition(event);
              if (drop?.id !== item.id || drop.position !== position) setDrop({ id: item.id, position });
            }}
            onDrop={(event) => {
              if (!accepts(item.id)) return;
              event.preventDefault();
              finishDrop(item.id, dropPosition(event));
              endDrag();
            }}
            onDragEnd={endDrag}
          >
            {item.leading != null ? <span className="tx-tree-list__leading">{item.leading}</span> : null}
            <span className="tx-tree-list__label">{item.label}</span>
            {item.meta != null ? <span className="tx-tree-list__meta">{item.meta}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}
