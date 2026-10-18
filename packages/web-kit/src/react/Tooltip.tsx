"use client";

import type { ReactNode } from "react";
import { Tooltip as Primitive } from "radix-ui";

export interface TooltipProps {
  /** The tooltip text. */
  content: ReactNode;
  /** The element the tooltip describes. Must accept a ref (a DOM element or forwardRef component). */
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delayDuration?: number;
}

/** A tooltip. Self-contained: no provider needed. */
export function Tooltip({ content, children, side = "top", delayDuration = 300 }: TooltipProps) {
  return (
    <Primitive.Provider delayDuration={delayDuration}>
      <Primitive.Root>
        <Primitive.Trigger asChild>{children}</Primitive.Trigger>
        <Primitive.Portal>
          <Primitive.Content className="tx-tooltip" side={side} sideOffset={6}>
            {content}
          </Primitive.Content>
        </Primitive.Portal>
      </Primitive.Root>
    </Primitive.Provider>
  );
}
