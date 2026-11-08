"use client";

import type { ComponentProps } from "react";
import { DropdownMenu as Primitive } from "radix-ui";
import { cx } from "./cx";
import { CheckIcon } from "./icons";
import { MenuItemContent, menuItemClass, type MenuItemExtras } from "./menu-item";

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export const DropdownMenuGroup = Primitive.Group;
export const DropdownMenuRadioGroup = Primitive.RadioGroup;
export const DropdownMenuSub = Primitive.Sub;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  align = "start",
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        className={cx("tx-menu", className)}
        sideOffset={sideOffset}
        align={align}
        {...props}
      />
    </Primitive.Portal>
  );
}

export type DropdownMenuItemProps = ComponentProps<typeof Primitive.Item> & MenuItemExtras;

export function DropdownMenuItem({
  icon,
  description,
  shortcut,
  tone,
  className,
  children,
  ...props
}: DropdownMenuItemProps) {
  return (
    <Primitive.Item className={menuItemClass(tone, className)} {...props}>
      <MenuItemContent icon={icon} description={description} shortcut={shortcut}>
        {children}
      </MenuItemContent>
    </Primitive.Item>
  );
}

export type DropdownMenuCheckboxItemProps = ComponentProps<typeof Primitive.CheckboxItem> &
  Omit<MenuItemExtras, "icon" | "tone">;

/** An item with a check mark that toggles (`checked`, `onCheckedChange`). */
export function DropdownMenuCheckboxItem({
  description,
  shortcut,
  className,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
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

export type DropdownMenuRadioItemProps = ComponentProps<typeof Primitive.RadioItem> &
  Omit<MenuItemExtras, "icon" | "tone">;

/** One choice in a DropdownMenuRadioGroup. */
export function DropdownMenuRadioItem({
  description,
  shortcut,
  className,
  children,
  ...props
}: DropdownMenuRadioItemProps) {
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

export type DropdownMenuSubTriggerProps = ComponentProps<typeof Primitive.SubTrigger> &
  Omit<MenuItemExtras, "shortcut" | "tone">;

/** The item that opens a submenu (wrap it and DropdownMenuSubContent in DropdownMenuSub). */
export function DropdownMenuSubTrigger({
  icon,
  description,
  className,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <Primitive.SubTrigger className={menuItemClass(undefined, className)} {...props}>
      <MenuItemContent icon={icon} description={description} submenu>
        {children}
      </MenuItemContent>
    </Primitive.SubTrigger>
  );
}

export function DropdownMenuSubContent({
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

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof Primitive.Label>) {
  return <Primitive.Label className={cx("tx-menu__label", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cx("tx-menu__separator", className)} {...props} />;
}
