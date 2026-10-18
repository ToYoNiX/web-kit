import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

export type AlertTone = "info" | "success" | "warning" | "danger";

export function Alert({
  tone = "info",
  title,
  className,
  children,
  role,
  ...props
}: ComponentProps<"div"> & { tone?: AlertTone; title?: ReactNode }) {
  return (
    <div
      role={role ?? (tone === "danger" || tone === "warning" ? "alert" : "status")}
      className={cx("tx-alert", tone !== "info" && `tx-alert--${tone}`, className)}
      {...props}
    >
      {title ? <strong className="tx-alert__title">{title}</strong> : null}
      {children}
    </div>
  );
}
