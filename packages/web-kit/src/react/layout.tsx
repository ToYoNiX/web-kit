import type { ComponentProps } from "react";
import { cx } from "./cx";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-container", className)} {...props} />;
}

export function Section({ className, ...props }: ComponentProps<"section">) {
  return <section className={cx("tx-section", className)} {...props} />;
}

export function Stack({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-stack", className)} {...props} />;
}

export function Row({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-row", className)} {...props} />;
}

/** Takes up the free space in a flex row (a toolbar, a status bar), pushing what follows to the end. */
export function Spacer({ className, ...props }: ComponentProps<"div">) {
  return <div aria-hidden="true" className={cx("tx-spacer", className)} {...props} />;
}
