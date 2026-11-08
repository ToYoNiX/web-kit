"use client";

import type { ComponentProps } from "react";
import { Toolbar as Primitive } from "radix-ui";
import { cx } from "./cx";
import type { ButtonVariant } from "./Button";

/**
 * A row of tool controls (role="toolbar"): Tab enters it once, arrow keys move between its
 * buttons. Controls inside are compact. Use ToolbarButton for the items, Spacer to push the
 * rest to the end, and ToolbarSeparator between groups.
 *
 *   <Toolbar aria-label="Edit">
 *     <ToolbarButton asChild>
 *       <IconButton label="Undo" shortcut="Ctrl Z"><UndoIcon /></IconButton>
 *     </ToolbarButton>
 *   </Toolbar>
 */
export function Toolbar({ className, ...props }: ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root className={cx("tx-toolbar", "tx-compact", className)} {...props} />;
}

export type ToolbarButtonProps = ComponentProps<typeof Primitive.Button> & {
  /** Styling when it renders its own button. Ignored with `asChild` (the child brings its own). */
  variant?: ButtonVariant;
};

/** A toolbar item. With `asChild`, it makes the child (an IconButton, a menu trigger…) the item. */
export function ToolbarButton({ variant = "secondary", asChild, className, ...props }: ToolbarButtonProps) {
  return (
    <Primitive.Button
      asChild={asChild}
      className={asChild ? className : cx("tx-btn", `tx-btn--${variant}`, className)}
      {...props}
    />
  );
}

export function ToolbarSeparator({ className, ...props }: ComponentProps<typeof Primitive.Separator>) {
  return <Primitive.Separator className={cx("tx-toolbar__separator", className)} {...props} />;
}
