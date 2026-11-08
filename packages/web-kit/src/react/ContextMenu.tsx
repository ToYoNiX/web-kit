"use client";

import type { ComponentProps } from "react";
import { ContextMenu as Primitive } from "radix-ui";
import { cx } from "./cx";
import { CheckIcon } from "./icons";
import { MenuItemContent, menuItemClass, type MenuItemExtras } from "./menu-item";

/**
 * A right-click menu (also long-press on touch screens). Wrap the area in ContextMenuTrigger;
 * the items are the same as DropdownMenu's.
 */
export const ContextMenu = Primitive.Root;
export const ContextMenuTrigger = Primitive.Trigger;
export const ContextMenuGroup = Primitive.Group;
export const ContextMenuRadioGroup = Primitive.RadioGroup;
export const ContextMenuSub = Primitive.Sub;

export function ContextMenuContent({ className, ...props }: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content className={cx("tx-menu", className)} {...props} />
    </Primitive.Portal>
  );
}

export type ContextMenuItemProps = ComponentProps<typeof Primitive.Item> & MenuItemExtras;

export function ContextMenuItem({
  icon,
  description,
  shortcut,
  tone,
  className,
  children,
  ...props
}: ContextMenuItemProps) {
  return (
    <Primitive.Item className={menuItemClass(tone, className)} {...props}>
      <MenuItemContent icon={icon} description={description} shortcut={shortcut}>
        {children}
      </MenuItemContent>
    </Primitive.Item>
  );
}

export type ContextMenuCheckboxItemProps = ComponentProps<typeof Primitive.CheckboxItem> &
  Omit<MenuItemExtras, "icon" | "tone">;

/** An item with a check mark that toggles (`checked`, `onCheckedChange`). */
export function ContextMenuCheckboxItem({
  description,
  shortcut,
  className,
  children,
  ...props
}: ContextMenuCheckboxItemProps) {
  const indicator = (
    <Primitive.ItemIndicator>
      <CheckIcon />
    </Primitive.ItemIndicator>
  );
  return (
    <Primitive.CheckboxItem className={menuItemClass(undefined, className)} {...props}>
      <MenuItemContent icon={indicator} description={description} shortcut={shortcut}>
        {children}
      </MenuItemContent>
    </Primitive.CheckboxItem>
  );
}

export type ContextMenuRadioItemProps = ComponentProps<typeof Primitive.RadioItem> &
  Omit<MenuItemExtras, "icon" | "tone">;

/** One choice in a ContextMenuRadioGroup. */
export function ContextMenuRadioItem({
  description,
  shortcut,
  className,
  children,
  ...props
}: ContextMenuRadioItemProps) {
  const indicator = (
    <Primitive.ItemIndicator>
      <span className="tx-menu__dot" />
    </Primitive.ItemIndicator>
  );
  return (
    <Primitive.RadioItem className={menuItemClass(undefined, className)} {...props}>
      <MenuItemContent icon={indicator} description={description} shortcut={shortcut}>
        {children}
      </MenuItemContent>
    </Primitive.RadioItem>
  );
}

export type ContextMenuSubTriggerProps = ComponentProps<typeof Primitive.SubTrigger> &
  Omit<MenuItemExtras, "shortcut" | "tone">;

/** The item that opens a submenu (wrap it and ContextMenuSubContent in ContextMenuSub). */
export function ContextMenuSubTrigger({
  icon,
  description,
  className,
  children,
  ...props
}: ContextMenuSubTriggerProps) {
  return (
    <Primitive.SubTrigger className={menuItemClass(undefined, className)} {...props}>
      <MenuItemContent icon={icon} description={description} submenu>
        {children}
      </MenuItemContent>
    </Primitive.SubTrigger>
  );
}

export function ContextMenuSubContent({
  className,
  sideOffset = 4,
  alignOffset = -8,
  ...props
}: ComponentProps<typeof Primitive.SubContent>) {
  return (
    <Primitive.Portal>
      <Primitive.SubContent
        className={cx("tx-menu", className)}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        {...props}
      />
    </Primitive.Portal>
  );
}

export function ContextMenuLabel({ className, ...props }: ComponentProps<typeof Primitive.Label>) {
  return <Primitive.Label className={cx("tx-menu__label", className)} {...props} />;
}

export function ContextMenuSeparator({ className, ...props }: ComponentProps<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cx("tx-menu__separator", className)} {...props} />;
}
