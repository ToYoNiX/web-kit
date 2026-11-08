"use client";

import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";
import { Tooltip, type TooltipProps } from "./Tooltip";
import { Kbd } from "./typography";

export interface IconButtonProps extends Omit<ComponentProps<"button">, "aria-label"> {
  /** What the button does. Used as its accessible name and shown in its tooltip. */
  label: string;
  /** A keyboard shortcut to show in the tooltip, e.g. "Ctrl Z". Binding the key is up to the app. */
  shortcut?: ReactNode;
  /** Makes it a toggle button (aria-pressed); a pressed button is highlighted. */
  pressed?: boolean;
  /** `sm` for tight spots such as panel headers. */
  size?: "md" | "sm";
  tooltipSide?: TooltipProps["side"];
  /** The icon, e.g. <UndoIcon />. */
  children: ReactNode;
}

/** A square button showing only an icon. Its label shows as a tooltip, so it never needs a guess. */
export function IconButton({
  label,
  shortcut,
  pressed,
  size = "md",
  tooltipSide = "bottom",
  className,
  type,
  children,
  ...props
}: IconButtonProps) {
  const tip =
    shortcut == null ? (
      label
    ) : (
      <>
        {label} <Kbd>{shortcut}</Kbd>
      </>
    );
  return (
    <Tooltip content={tip} side={tooltipSide}>
      <button
        type={type ?? "button"}
        className={cx("tx-icon-btn", size === "sm" && "tx-icon-btn--sm", className)}
        aria-label={label}
        aria-pressed={pressed}
        {...props}
      >
        {children}
      </button>
    </Tooltip>
  );
}
