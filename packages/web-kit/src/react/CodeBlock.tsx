import type { ComponentProps } from "react";
import { cx } from "./cx";

/**
 * A code block. Pass plain text, or pre-highlighted markup using the token classes
 * tx-code__comment, tx-code__key, and tx-code__string.
 */
export function CodeBlock({ className, children, ...props }: ComponentProps<"pre">) {
  return (
    <pre className={cx("tx-code", className)} {...props}>
      <code>{children}</code>
    </pre>
  );
}
