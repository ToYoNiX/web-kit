"use client";

import type { ComponentProps } from "react";
import { ToggleGroup as Primitive } from "radix-ui";
import { cx } from "./cx";

/**
 * A segmented control: joined buttons where one (`type="single"`) or several (`type="multiple"`)
 * can be on. Arrow keys move between the options.
 *
 *   <ToggleGroup type="single" value={op} onValueChange={(v) => v && setOp(v)} aria-label="Operation">
 *     <ToggleGroupItem value="add">Add</ToggleGroupItem>
 *     <ToggleGroupItem value="subtract">Subtract</ToggleGroupItem>
 *   </ToggleGroup>
 *
 * With `type="single"`, clicking the active option clears the value (""): ignore that, as
 * above, if one option must always be on.
 */
export function ToggleGroup({ className, ...props }: ComponentProps<typeof Primitive.Root>) {
  return <Primitive.Root className={cx("tx-toggle-group", className)} {...props} />;
}

export function ToggleGroupItem({ className, ...props }: ComponentProps<typeof Primitive.Item>) {
  return <Primitive.Item className={cx("tx-toggle-group__item", className)} {...props} />;
}
