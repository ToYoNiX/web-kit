import type { ComponentProps } from "react";
import { cx } from "./cx";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return <span className={cx("tx-badge", `tx-badge--${tone}`, className)} {...props} />;
}

export function Badges({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-badges", className)} {...props} />;
}

export function Tag({ className, ...props }: ComponentProps<"span">) {
  return <span className={cx("tx-tag", className)} {...props} />;
}

export function Tags({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-tags", className)} {...props} />;
}
