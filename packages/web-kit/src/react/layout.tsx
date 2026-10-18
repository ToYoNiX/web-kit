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
