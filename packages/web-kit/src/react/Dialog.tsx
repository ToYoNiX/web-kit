"use client";

import type { ComponentProps, ReactNode } from "react";
import { Dialog as Primitive } from "radix-ui";
import { cx } from "./cx";

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;

export interface DialogContentProps extends Omit<ComponentProps<typeof Primitive.Content>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Hide the × button (e.g. when the dialog has its own close action). */
  hideClose?: boolean;
}

/** A modal dialog. The title is required for screen readers. */
export function DialogContent({
  title,
  description,
  hideClose,
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="tx-overlay" />
      <Primitive.Content className={cx("tx-dialog", className)} {...props}>
        <Primitive.Title className="tx-dialog__title">{title}</Primitive.Title>
        {description ? (
          <Primitive.Description className="tx-dialog__description">{description}</Primitive.Description>
        ) : null}
        {children}
        {hideClose ? null : (
          <Primitive.Close className="tx-btn tx-btn--ghost tx-dialog__close" aria-label="Close">
            ✕
          </Primitive.Close>
        )}
      </Primitive.Content>
    </Primitive.Portal>
  );
}
