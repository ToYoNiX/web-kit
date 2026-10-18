import type { ComponentProps } from "react";
import { Slot } from "radix-ui";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonOwnProps {
  variant?: ButtonVariant;
  /** Render the single child (e.g. next/link's <Link>) with button styling instead of a <button>. */
  asChild?: boolean;
}

export type ButtonProps = ButtonOwnProps & ComponentProps<"button">;

export function Button({ variant = "primary", asChild = false, className, type, ...props }: ButtonProps) {
  const classes = cx("tx-btn", `tx-btn--${variant}`, className);
  if (asChild) return <Slot.Root className={classes} {...props} />;
  return <button type={type ?? "button"} className={classes} {...props} />;
}

export type LinkButtonProps = ButtonOwnProps & ComponentProps<"a">;

/** A link styled as a button. For in-app links use <Button asChild><Link …/></Button>. */
export function LinkButton({ variant = "primary", asChild = false, className, ...props }: LinkButtonProps) {
  const classes = cx("tx-btn", `tx-btn--${variant}`, className);
  if (asChild) return <Slot.Root className={classes} {...props} />;
  return <a className={classes} {...props} />;
}

export function ButtonRow({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-btn-row", className)} {...props} />;
}
