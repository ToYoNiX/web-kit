import type { ReactNode } from "react";
import { cx } from "./cx";
import { ChevronRightIcon } from "./icons";
import { Kbd } from "./typography";

/** Extra content a menu item can show, shared by DropdownMenu and ContextMenu. */
export interface MenuItemExtras {
  /** An icon before the label. */
  icon?: ReactNode;
  /** A second, smaller line under the label. */
  description?: ReactNode;
  /** A keyboard shortcut shown at the end, e.g. "Ctrl D". Binding the key is up to the app. */
  shortcut?: ReactNode;
  /** `danger` for destructive actions such as Delete. */
  tone?: "danger";
}

export function menuItemClass(tone: MenuItemExtras["tone"], className: string | undefined) {
  return cx("tx-menu__item", tone === "danger" && "tx-menu__item--danger", className);
}

/** The inside of a menu item. Plain items (no extras) render their children unchanged. */
export function MenuItemContent({
  icon,
  description,
  shortcut,
  submenu,
  children,
}: Omit<MenuItemExtras, "tone"> & { submenu?: boolean; children?: ReactNode }) {
  return (
    <>
      {icon == null ? null : <span className="tx-menu__icon">{icon}</span>}
      {description == null ? (
        children
      ) : (
        <span className="tx-menu__text">
          <span>{children}</span>
          <span className="tx-menu__description">{description}</span>
        </span>
      )}
      {shortcut == null ? null : <Kbd className="tx-menu__shortcut">{shortcut}</Kbd>}
      {submenu ? <ChevronRightIcon className="tx-menu__chevron" /> : null}
    </>
  );
}
