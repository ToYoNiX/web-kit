import type { ComponentProps } from "react";
import { Slot } from "radix-ui";
import { cx } from "./cx";

export type CardProps = ComponentProps<"div"> & {
  /** Render the single child (e.g. <Link>) as the card. */
  asChild?: boolean;
  /** Hover lift + link styling. On by default when `asChild` is used. */
  interactive?: boolean;
};

export function Card({ asChild = false, interactive, className, ...props }: CardProps) {
  const classes = cx("tx-card", (interactive ?? asChild) && "tx-card--link", className);
  if (asChild) return <Slot.Root className={classes} {...props} />;
  return <div className={classes} {...props} />;
}

/** A card that is a plain link (e.g. to another app). Lifts on hover. */
export function LinkCard({ className, ...props }: ComponentProps<"a">) {
  return <a className={cx("tx-card", "tx-card--link", className)} {...props} />;
}

/** Grid of color-blocked, tilted cards (cycling card-1 → card-2 → card-3). */
export function CardGrid({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-card-grid", className)} {...props} />;
}

export function CardTop({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("tx-card__top", className)} {...props} />;
}

export function CardMeta({ className, ...props }: ComponentProps<"span">) {
  return <span className={cx("tx-card__meta", className)} {...props} />;
}

export function CardTitle({
  as: Tag = "h3",
  className,
  ...props
}: ComponentProps<"h3"> & { as?: "h2" | "h3" | "h4" }) {
  return <Tag className={cx("tx-card__title", className)} {...props} />;
}

export function CardBody({ className, ...props }: ComponentProps<"p">) {
  return <p className={cx("tx-card__body", className)} {...props} />;
}

export function CardCta({ className, ...props }: ComponentProps<"span">) {
  return <span className={cx("tx-card__cta", className)} {...props} />;
}
