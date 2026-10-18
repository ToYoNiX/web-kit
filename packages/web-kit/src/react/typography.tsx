import type { ComponentProps, ComponentPropsWithoutRef } from "react";
import { cx } from "./cx";

type HeadingLevel = "h1" | "h2" | "h3";

/** Big serif headline. Wrap words in <em> for the marker highlight. */
export function Display({
  as: Tag = "h1",
  className,
  ...props
}: ComponentProps<"h1"> & { as?: HeadingLevel }) {
  return <Tag className={cx("tx-display", className)} {...props} />;
}

/** Marker highlight for any inline text. */
export function Mark({ className, ...props }: ComponentProps<"em">) {
  return <em className={cx("tx-mark", className)} {...props} />;
}

export function Lead({ className, ...props }: ComponentProps<"p">) {
  return <p className={cx("tx-lead", className)} {...props} />;
}

/** Small mono uppercase line above a heading. */
export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return <p className={cx("tx-eyebrow", className)} {...props} />;
}

/** Tilted serif tag that labels a page section. */
export function SectionLabel({
  as: Tag = "h2",
  className,
  ...props
}: ComponentProps<"h2"> & { as?: HeadingLevel }) {
  return <Tag className={cx("tx-section-label", className)} {...props} />;
}

/** Article typography (MDX output goes inside). `dropcap` styles the first paragraph's letter. */
export function Prose({
  as: Tag = "article",
  dropcap = false,
  className,
  ...props
}: ComponentPropsWithoutRef<"article"> & { as?: "article" | "div" | "section"; dropcap?: boolean }) {
  return <Tag className={cx("tx-prose", dropcap && "tx-prose--dropcap", className)} {...props} />;
}
